import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch all necessary data
    const { data: students } = await supabaseClient.from('students').select('*')
    const { data: criteria } = await supabaseClient.from('criteria').select('*')
    const { data: comparisons } = await supabaseClient.from('criteria_comparisons').select('*')
    const { data: scores } = await supabaseClient.from('student_scores').select('*')

    if (!students || !criteria || students.length === 0 || criteria.length === 0) {
      throw new Error('Missing required data')
    }

    // Build pairwise comparison matrix
    const n = criteria.length
    const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(1))
    
    comparisons?.forEach((comp: any) => {
      const i = criteria.findIndex(c => c.id === comp.criteria1_id)
      const j = criteria.findIndex(c => c.id === comp.criteria2_id)
      if (i !== -1 && j !== -1) {
        matrix[i][j] = comp.comparison_value
        matrix[j][i] = 1 / comp.comparison_value
      }
    })

    // Calculate criteria weights using eigenvector method
    const weights: number[] = calculateWeights(matrix)

    // Update criteria weights
    for (let i = 0; i < criteria.length; i++) {
      await supabaseClient
        .from('criteria')
        .update({ weight: weights[i] })
        .eq('id', criteria[i].id)
    }

    // Calculate final scores for each student
    const results = students.map(student => {
      let finalScore = 0
      
      criteria.forEach((criterion, index) => {
        const studentScore = scores?.find(
          s => s.student_id === student.id && s.criteria_id === criterion.id
        )
        if (studentScore) {
          finalScore += (studentScore.score / 100) * weights[index]
        }
      })
      
      return {
        student_id: student.id,
        final_score: finalScore
      }
    })

    // Sort by final score descending
    results.sort((a, b) => b.final_score - a.final_score)

    // Delete old results
    await supabaseClient.from('ahp_results').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Insert new results with ranks
    const insertData = results.map((result, index) => ({
      student_id: result.student_id,
      final_score: result.final_score,
      rank: index + 1
    }))

    await supabaseClient.from('ahp_results').insert(insertData)

    return new Response(
      JSON.stringify({ success: true, message: 'AHP calculation completed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function calculateWeights(matrix: number[][]): number[] {
  const n = matrix.length
  
  // Calculate column sums
  const columnSums = Array(n).fill(0)
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      columnSums[j] += matrix[i][j]
    }
  }
  
  // Normalize matrix
  const normalized: number[][] = Array(n).fill(null).map(() => Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      normalized[i][j] = matrix[i][j] / columnSums[j]
    }
  }
  
  // Calculate row averages (priority vector)
  const weights = Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    let sum = 0
    for (let j = 0; j < n; j++) {
      sum += normalized[i][j]
    }
    weights[i] = sum / n
  }
  
  return weights
}

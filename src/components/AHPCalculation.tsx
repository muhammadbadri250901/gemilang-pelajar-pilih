
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Calculator, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  name: string;
  class: string;
  nis: string;
}

interface Criteria {
  id: string;
  name: string;
  weight: number;
}

interface Score {
  student_id: string;
  criteria_id: string;
  score: number;
}

interface AhpResult {
  id: string;
  student_id: string;
  student: Student;
  final_score: number;
  rank: number;
  criteriaScores: {[criteriaId: string]: number};
}

const AHPCalculation = () => {
  const [calculationStep, setCalculationStep] = useState(0);
  const [results, setResults] = useState<AhpResult[] | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if there are already results in the database
    checkExistingResults();
  }, []);

  const checkExistingResults = async () => {
    try {
      const { data, error } = await supabase
        .from('ahp_results')
        .select(`
          id,
          student_id,
          final_score,
          rank,
          students (
            id,
            name,
            class,
            nis
          )
        `)
        .order('rank');

      if (error) throw error;

      if (data && data.length > 0) {
        // Format the results and fetch scores for each student
        const formattedResults: AhpResult[] = [];
        
        for (const result of data) {
          const student = result.students as Student;
          
          // Get scores for this student
          const { data: studentScores } = await supabase
            .from('student_scores')
            .select('criteria_id, score')
            .eq('student_id', student.id);
          
          const criteriaScores: {[criteriaId: string]: number} = {};
          if (studentScores) {
            studentScores.forEach(score => {
              criteriaScores[score.criteria_id] = score.score;
            });
          }
          
          formattedResults.push({
            id: result.id,
            student_id: result.student_id,
            student,
            final_score: result.final_score,
            rank: result.rank,
            criteriaScores
          });
        }
        
        setResults(formattedResults);
        setCalculationStep(3);
      }
    } catch (error) {
      console.error('Error checking existing results:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load criteria with weights
      const { data: criteriaData, error: criteriaError } = await supabase
        .from('criteria')
        .select('id, name, weight');

      if (criteriaError) throw criteriaError;

      // Check if criteria weights are set
      const missingWeights = criteriaData.some(c => c.weight === null || c.weight === undefined);
      if (missingWeights) {
        toast({
          title: "Peringatan",
          description: "Bobot kriteria belum dihitung. Silahkan hitung bobot di halaman Kriteria terlebih dahulu.",
          variant: "destructive",
        });
        return false;
      }

      setCriteria(criteriaData || []);

      // Load students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, name, class, nis');

      if (studentsError) throw studentsError;
      
      if (!studentsData || studentsData.length === 0) {
        toast({
          title: "Peringatan",
          description: "Belum ada data siswa. Silahkan tambahkan data siswa terlebih dahulu.",
          variant: "destructive",
        });
        return false;
      }

      setStudents(studentsData);

      // Load scores
      const { data: scoresData, error: scoresError } = await supabase
        .from('student_scores')
        .select('student_id, criteria_id, score');

      if (scoresError) throw scoresError;
      setScores(scoresData || []);

      // Check if every student has scores for every criteria
      let missingScores = false;
      for (const student of studentsData) {
        for (const criterion of criteriaData) {
          const hasScore = scoresData.some(
            score => score.student_id === student.id && score.criteria_id === criterion.id
          );
          
          if (!hasScore) {
            missingScores = true;
            break;
          }
        }
        
        if (missingScores) break;
      }

      if (missingScores) {
        toast({
          title: "Peringatan",
          description: "Beberapa siswa belum memiliki nilai lengkap untuk semua kriteria.",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const calculateAHP = async () => {
    const dataReady = await loadData();
    if (!dataReady) return;
    
    setCalculationStep(1);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Step 1: Normalisasi nilai
      setCalculationStep(2);
      
      // Get max scores for each criteria for normalization
      const maxScores: {[key: string]: number} = {};
      criteria.forEach(criterion => {
        const criteriaScores = scores.filter(s => s.criteria_id === criterion.id);
        maxScores[criterion.id] = Math.max(...criteriaScores.map(s => s.score), 1); // Default to 1 if no scores
      });
      
      // Step 2: Hitung skor AHP
      const ahpResults = students.map(student => {
        const studentScores: {[key: string]: number} = {};
        const normalizedScores: {[key: string]: number} = {};
        let ahpScore = 0;
        
        criteria.forEach(criterion => {
          const score = scores.find(s => 
            s.student_id === student.id && s.criteria_id === criterion.id
          );
          
          const rawScore = score ? score.score : 0;
          studentScores[criterion.id] = rawScore;
          
          // Normalize
          const normalizedScore = rawScore / maxScores[criterion.id];
          normalizedScores[criterion.id] = normalizedScore;
          
          // Calculate weighted score
          ahpScore += normalizedScore * (criterion.weight || 0);
        });
        
        return {
          student,
          studentScores,
          normalizedScores,
          ahpScore,
          percentage: (ahpScore * 100).toFixed(2)
        };
      });
      
      // Sort by AHP score
      ahpResults.sort((a, b) => b.ahpScore - a.ahpScore);
      
      // Assign ranks
      ahpResults.forEach((result, index) => {
        result.rank = index + 1;
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setCalculationStep(3);
      
      // Save results to database
      await saveResults(ahpResults);
      
      // Format results for display
      const formattedResults = ahpResults.map(result => ({
        id: '', // Will be filled in when we save to database
        student_id: result.student.id,
        student: result.student,
        final_score: result.ahpScore,
        rank: result.rank,
        criteriaScores: result.studentScores
      }));
      
      setResults(formattedResults);
      
      toast({
        title: "Perhitungan Selesai",
        description: "Hasil perhitungan AHP telah berhasil digenerate",
      });
    } catch (error) {
      console.error('Error calculating AHP:', error);
      toast({
        title: "Error",
        description: "Gagal menghitung AHP",
        variant: "destructive",
      });
    }
  };

  const saveResults = async (ahpResults: any[]) => {
    try {
      // First delete existing results
      await supabase
        .from('ahp_results')
        .delete()
        .gt('id', '0');
      
      // Then insert new results
      const resultsToInsert = ahpResults.map(result => ({
        student_id: result.student.id,
        final_score: result.ahpScore,
        rank: result.rank
      }));
      
      await supabase
        .from('ahp_results')
        .insert(resultsToInsert);
    } catch (error) {
      console.error('Error saving results:', error);
      toast({
        title: "Peringatan",
        description: "Hasil perhitungan berhasil tetapi gagal disimpan ke database",
        variant: "destructive",
      });
    }
  };

  const resetCalculation = async () => {
    try {
      // Delete existing results
      await supabase
        .from('ahp_results')
        .delete()
        .gt('id', '0');
      
      setCalculationStep(0);
      setResults(null);
      
      toast({
        title: "Reset Berhasil",
        description: "Hasil perhitungan telah dihapus",
      });
    } catch (error) {
      console.error('Error resetting calculation:', error);
      toast({
        title: "Error",
        description: "Gagal mereset perhitungan",
        variant: "destructive",
      });
    }
  };

  const getCriteriaById = (criteriaId: string) => {
    return criteria.find(c => c.id === criteriaId);
  };

  const getCriteriaName = (criteriaId: string) => {
    const criterion = getCriteriaById(criteriaId);
    return criterion ? criterion.name : '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Perhitungan AHP
          </CardTitle>
        </CardHeader>
        <CardContent>
          {calculationStep === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">
                Mulai perhitungan AHP untuk menentukan ranking siswa berprestasi
              </p>
              <Button 
                onClick={calculateAHP} 
                size="lg" 
                className="px-8"
                disabled={loading}
              >
                {loading ? 'Memuat Data...' : 'Mulai Perhitungan'}
              </Button>
            </div>
          )}

          {calculationStep > 0 && calculationStep < 4 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Proses Perhitungan</h3>
                <Progress value={calculationStep * 33.33} className="w-full" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg ${calculationStep >= 1 ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center">
                    {calculationStep >= 1 && <CheckCircle className="h-5 w-5 text-green-600 mr-2" />}
                    <span className={calculationStep >= 1 ? 'text-green-800' : 'text-gray-600'}>
                      1. Ambil Data Siswa
                    </span>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${calculationStep >= 2 ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center">
                    {calculationStep >= 2 && <CheckCircle className="h-5 w-5 text-green-600 mr-2" />}
                    <span className={calculationStep >= 2 ? 'text-green-800' : 'text-gray-600'}>
                      2. Normalisasi Nilai
                    </span>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${calculationStep >= 3 ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center">
                    {calculationStep >= 3 && <CheckCircle className="h-5 w-5 text-green-600 mr-2" />}
                    <span className={calculationStep >= 3 ? 'text-green-800' : 'text-gray-600'}>
                      3. Hitung Skor AHP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Hasil Perhitungan</h3>
                <Button variant="outline" onClick={resetCalculation}>
                  Hitung Ulang
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Bobot Kriteria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {criteria.map((criterion) => (
                      <div key={criterion.id} className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="font-semibold text-blue-900">{criterion.name}</div>
                        <div className="text-2xl font-bold text-blue-700">
                          {criterion.weight !== undefined ? (criterion.weight * 100).toFixed(0) : 0}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ranking Siswa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Nama Siswa</TableHead>
                          {criteria.map(criterion => (
                            <TableHead key={criterion.id}>{criterion.name}</TableHead>
                          ))}
                          <TableHead>Skor AHP</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.map((student: AhpResult) => (
                          <TableRow key={student.student_id} className={student.rank <= 3 ? 'bg-yellow-50' : ''}>
                            <TableCell className="font-bold">#{student.rank}</TableCell>
                            <TableCell className="font-medium">{student.student.name}</TableCell>
                            {criteria.map(criterion => (
                              <TableCell key={criterion.id}>
                                {student.criteriaScores[criterion.id] || 0}
                              </TableCell>
                            ))}
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-green-600">
                                  {(student.final_score * 100).toFixed(2)}%
                                </span>
                                {student.rank <= 3 && <span className="text-yellow-600">🏆</span>}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AHPCalculation;

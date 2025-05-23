
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Calculator, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AHPCalculation = () => {
  const [calculationStep, setCalculationStep] = useState(0);
  const [results, setResults] = useState<any>(null);

  const criteria = [
    { name: 'Akademik', weight: 0.35 },
    { name: 'Perilaku', weight: 0.25 },
    { name: 'Prestasi', weight: 0.20 },
    { name: 'Kepemimpinan', weight: 0.12 },
    { name: 'Kehadiran', weight: 0.08 }
  ];

  const students = [
    {
      name: 'Ahmad Rizki',
      scores: [85, 90, 75, 80, 95],
      normalizedScores: [0.89, 0.94, 0.79, 0.84, 1.0]
    },
    {
      name: 'Siti Nurhaliza',
      scores: [92, 88, 85, 90, 96],
      normalizedScores: [0.97, 0.92, 0.89, 0.95, 1.0]
    },
    {
      name: 'Budi Santoso',
      scores: [88, 85, 70, 85, 92],
      normalizedScores: [0.92, 0.89, 0.74, 0.89, 0.96]
    }
  ];

  const calculateAHP = async () => {
    setCalculationStep(1);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 1: Normalisasi nilai
    setCalculationStep(2);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Hitung skor AHP
    const ahpResults = students.map(student => {
      const ahpScore = student.normalizedScores.reduce((total, score, index) => {
        return total + (score * criteria[index].weight);
      }, 0);

      return {
        ...student,
        ahpScore: ahpScore,
        percentage: (ahpScore * 100).toFixed(2)
      };
    });

    // Sort by AHP score
    ahpResults.sort((a, b) => b.ahpScore - a.ahpScore);

    setCalculationStep(3);
    await new Promise(resolve => setTimeout(resolve, 1000));

    setResults(ahpResults);
    toast({
      title: "Perhitungan Selesai",
      description: "Hasil perhitungan AHP telah berhasil digenerate",
    });
  };

  const resetCalculation = () => {
    setCalculationStep(0);
    setResults(null);
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
              <Button onClick={calculateAHP} size="lg" className="px-8">
                Mulai Perhitungan
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
                    {criteria.map((criterion, index) => (
                      <div key={index} className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="font-semibold text-blue-900">{criterion.name}</div>
                        <div className="text-2xl font-bold text-blue-700">
                          {(criterion.weight * 100).toFixed(0)}%
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Nama Siswa</TableHead>
                        <TableHead>Akademik</TableHead>
                        <TableHead>Perilaku</TableHead>
                        <TableHead>Prestasi</TableHead>
                        <TableHead>Kepemimpinan</TableHead>
                        <TableHead>Kehadiran</TableHead>
                        <TableHead>Skor AHP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((student: any, index: number) => (
                        <TableRow key={index} className={index < 3 ? 'bg-yellow-50' : ''}>
                          <TableCell className="font-bold">#{index + 1}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.scores[0]}</TableCell>
                          <TableCell>{student.scores[1]}</TableCell>
                          <TableCell>{student.scores[2]}</TableCell>
                          <TableCell>{student.scores[3]}</TableCell>
                          <TableCell>{student.scores[4]}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-green-600">
                                {student.percentage}%
                              </span>
                              {index < 3 && <span className="text-yellow-600">🏆</span>}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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

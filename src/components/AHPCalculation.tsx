
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Calculator, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AhpResult {
  id: string;
  student_id: string;
  student: {
    id: string;
    name: string;
    class: string;
    nis: string;
  };
  final_score: number;
  rank: number;
  criteria_scores: {[criteriaName: string]: number};
}

const AHPCalculation = () => {
  const [calculationStep, setCalculationStep] = useState(0);
  const [results, setResults] = useState<AhpResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkExistingResults();
  }, []);

  const checkExistingResults = async () => {
    try {
      console.log('Checking for existing AHP results...');
      
      const response = await apiClient.getAHPResults();
      
      if (response.success && response.data && response.data.length > 0) {
        console.log('Found existing results:', response.data);
        setResults(response.data);
        setCalculationStep(3);
      }
    } catch (error) {
      console.error('Error checking existing results:', error);
    }
  };

  const calculateAHP = async () => {
    console.log('Starting AHP calculation...');
    setError(null);
    setLoading(true);
    setCalculationStep(1);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCalculationStep(2);
      
      const response = await apiClient.calculateAHP();
      
      if (response.success) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setCalculationStep(3);
        
        // Fetch updated results
        const resultsResponse = await apiClient.getAHPResults();
        if (resultsResponse.success) {
          setResults(resultsResponse.data || []);
          
          toast({
            title: "Perhitungan Selesai",
            description: `Hasil perhitungan AHP telah berhasil digenerate untuk ${resultsResponse.data?.length || 0} siswa`,
          });
        }
      } else {
        throw new Error(response.message || 'Gagal menghitung AHP');
      }
      
    } catch (error: any) {
      console.error('Error calculating AHP:', error);
      setError(error.message || 'Gagal menghitung AHP');
      toast({
        title: "Error",
        description: "Gagal menghitung AHP: " + (error.message || 'Unknown error'),
        variant: "destructive",
      });
      setCalculationStep(0);
    } finally {
      setLoading(false);
    }
  };

  const resetCalculation = async () => {
    try {
      console.log('Resetting calculation...');
      
      const response = await apiClient.resetAHPResults();
      
      if (response.success) {
        setCalculationStep(0);
        setResults(null);
        setError(null);
        
        toast({
          title: "Reset Berhasil",
          description: "Hasil perhitungan telah dihapus",
        });
      }
    } catch (error) {
      console.error('Error resetting calculation:', error);
      toast({
        title: "Error",
        description: "Gagal mereset perhitungan",
        variant: "destructive",
      });
    }
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
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Peringatan</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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

          {results && results.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Hasil Perhitungan AHP</h3>
                <Button variant="outline" onClick={resetCalculation}>
                  Hitung Ulang
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Ranking Siswa Berprestasi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Nama Siswa</TableHead>
                          <TableHead>NIS</TableHead>
                          <TableHead>Kelas</TableHead>
                          <TableHead>Skor AHP</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.map((result: AhpResult) => (
                          <TableRow key={result.student_id} className={result.rank <= 3 ? 'bg-yellow-50' : ''}>
                            <TableCell className="font-bold">
                              <div className="flex items-center">
                                #{result.rank}
                                {result.rank <= 3 && <span className="ml-2 text-yellow-600">🏆</span>}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{result.student.name}</TableCell>
                            <TableCell>{result.student.nis}</TableCell>
                            <TableCell>{result.student.class}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-green-600">
                                  {(result.final_score * 100).toFixed(2)}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {results.length >= 3 && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800">🎉 Top 3 Siswa Berprestasi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {results.slice(0, 3).map((result, index) => (
                        <div key={result.student_id} className="text-center p-4 bg-white rounded-lg border-2 border-green-300">
                          <div className="text-3xl mb-2">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </div>
                          <div className="font-bold text-lg">{result.student.name}</div>
                          <div className="text-gray-600">{result.student.nis}</div>
                          <div className="text-green-600 font-bold text-xl mt-2">
                            {(result.final_score * 100).toFixed(2)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {calculationStep === 3 && (!results || results.length === 0) && (
            <Alert className="mt-4 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle>Tidak Ada Hasil</AlertTitle>
              <AlertDescription>
                Perhitungan selesai tetapi tidak ada hasil yang ditampilkan. Kemungkinan penyebabnya:
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Data kriteria atau siswa tidak lengkap</li>
                  <li>Bobot kriteria belum dihitung</li>
                  <li>Terjadi kesalahan saat menyimpan hasil ke database</li>
                </ul>
                <Button className="mt-3" onClick={resetCalculation}>
                  Reset dan Coba Lagi
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AHPCalculation;

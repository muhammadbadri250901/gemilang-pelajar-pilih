
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface Criteria {
  id: number;
  name: string;
  description: string;
}

const CriteriaManagement = () => {
  const criteria: Criteria[] = [
    { id: 1, name: 'Akademik', description: 'Nilai rata-rata mata pelajaran' },
    { id: 2, name: 'Perilaku', description: 'Penilaian sikap dan karakter' },
    { id: 3, name: 'Prestasi', description: 'Prestasi akademik dan non-akademik' },
    { id: 4, name: 'Kepemimpinan', description: 'Kemampuan memimpin dan berorganisasi' },
    { id: 5, name: 'Kehadiran', description: 'Tingkat kehadiran di sekolah' }
  ];

  const [pairwiseMatrix, setPairwiseMatrix] = useState<number[][]>(
    Array(criteria.length).fill(null).map(() => Array(criteria.length).fill(1))
  );

  const ahpScale = [
    { value: 9, label: '9 - Mutlak lebih penting' },
    { value: 8, label: '8 - Sangat lebih penting (+)' },
    { value: 7, label: '7 - Sangat lebih penting' },
    { value: 6, label: '6 - Lebih penting (+)' },
    { value: 5, label: '5 - Lebih penting' },
    { value: 4, label: '4 - Agak lebih penting (+)' },
    { value: 3, label: '3 - Agak lebih penting' },
    { value: 2, label: '2 - Sama penting (+)' },
    { value: 1, label: '1 - Sama penting' },
    { value: 0.5, label: '1/2 - Sama penting (-)' },
    { value: 0.33, label: '1/3 - Agak kurang penting' },
    { value: 0.25, label: '1/4 - Agak kurang penting (-)' },
    { value: 0.2, label: '1/5 - Kurang penting' },
    { value: 0.17, label: '1/6 - Kurang penting (-)' },
    { value: 0.14, label: '1/7 - Sangat kurang penting' },
    { value: 0.13, label: '1/8 - Sangat kurang penting (-)' },
    { value: 0.11, label: '1/9 - Mutlak kurang penting' }
  ];

  const updateMatrix = (i: number, j: number, value: number) => {
    const newMatrix = [...pairwiseMatrix];
    newMatrix[i][j] = value;
    newMatrix[j][i] = 1 / value; // Reciprocal value
    setPairwiseMatrix(newMatrix);
  };

  const calculateWeights = () => {
    // Normalisasi matriks
    const normalizedMatrix = pairwiseMatrix.map((row, i) => {
      const columnSum = pairwiseMatrix.reduce((sum, r) => sum + r[i], 0);
      return row.map(value => value / columnSum);
    });

    // Hitung eigen vector (rata-rata baris)
    const weights = normalizedMatrix.map(row => 
      row.reduce((sum, value) => sum + value, 0) / row.length
    );

    // Hitung Consistency Index (CI)
    const lambda = pairwiseMatrix.reduce((sum, row, i) => {
      const weightedSum = row.reduce((s, value, j) => s + value * weights[j], 0);
      return sum + weightedSum * weights[i];
    }, 0);

    const ci = (lambda - criteria.length) / (criteria.length - 1);
    const ri = [0, 0, 0.52, 0.89, 1.11, 1.25, 1.35, 1.40, 1.45][criteria.length - 1];
    const cr = ci / ri;

    console.log('Weights:', weights);
    console.log('Lambda Max:', lambda);
    console.log('CI:', ci);
    console.log('CR:', cr);

    if (cr <= 0.1) {
      toast({
        title: "Perhitungan Berhasil",
        description: `Consistency Ratio: ${(cr * 100).toFixed(2)}% (Konsisten)`,
      });
    } else {
      toast({
        title: "Peringatan",
        description: `Consistency Ratio: ${(cr * 100).toFixed(2)}% (Tidak Konsisten)`,
        variant: "destructive",
      });
    }

    return { weights, cr };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kriteria Penilaian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criteria.map((criterion) => (
              <div key={criterion.id} className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-gray-900">{criterion.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{criterion.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matriks Perbandingan Berpasangan</CardTitle>
          <p className="text-sm text-gray-600">
            Bandingkan setiap kriteria dengan kriteria lainnya menggunakan skala AHP
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-50">Kriteria</th>
                  {criteria.map((c) => (
                    <th key={c.id} className="border p-2 bg-gray-50 text-sm">
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {criteria.map((rowCriteria, i) => (
                  <tr key={rowCriteria.id}>
                    <td className="border p-2 font-medium bg-gray-50">
                      {rowCriteria.name}
                    </td>
                    {criteria.map((colCriteria, j) => (
                      <td key={colCriteria.id} className="border p-1">
                        {i === j ? (
                          <div className="text-center py-2">1</div>
                        ) : i < j ? (
                          <Select
                            value={pairwiseMatrix[i][j].toString()}
                            onValueChange={(value) => updateMatrix(i, j, parseFloat(value))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ahpScale.map((scale) => (
                                <SelectItem key={scale.value} value={scale.value.toString()}>
                                  {scale.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="text-center py-2 text-gray-600">
                            {pairwiseMatrix[i][j].toFixed(2)}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button onClick={calculateWeights} className="px-8">
              Hitung Bobot Kriteria
            </Button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Petunjuk Skala AHP:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
              <div>• 1 = Sama penting</div>
              <div>• 3 = Agak lebih penting</div>
              <div>• 5 = Lebih penting</div>
              <div>• 7 = Sangat lebih penting</div>
              <div>• 9 = Mutlak lebih penting</div>
              <div>• 2,4,6,8 = Nilai antara</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CriteriaManagement;


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Star } from 'lucide-react';

const RankingResults = () => {
  const results = [
    {
      rank: 1,
      name: 'Siti Nurhaliza',
      class: '9B',
      score: 93.45,
      criteria: {
        academic: 92,
        behavior: 88,
        achievement: 85,
        leadership: 90,
        attendance: 96
      }
    },
    {
      rank: 2,
      name: 'Budi Santoso',
      class: '9A',
      score: 87.23,
      criteria: {
        academic: 88,
        behavior: 85,
        achievement: 70,
        leadership: 85,
        attendance: 92
      }
    },
    {
      rank: 3,
      name: 'Ahmad Rizki',
      class: '9A',
      score: 86.78,
      criteria: {
        academic: 85,
        behavior: 90,
        achievement: 75,
        leadership: 80,
        attendance: 95
      }
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <Star className="h-6 w-6 text-blue-500" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-amber-400 to-amber-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
            Hasil Ranking Siswa Berprestasi
          </CardTitle>
          <p className="text-sm text-gray-600">
            Berdasarkan perhitungan metode AHP dengan 5 kriteria penilaian
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.map((student) => (
              <Card key={student.rank} className={`${student.rank <= 3 ? 'ring-2 ring-yellow-200' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full bg-gradient-to-r ${getRankColor(student.rank)}`}>
                        {getRankIcon(student.rank)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xl font-bold text-gray-900">{student.name}</h3>
                          <Badge variant={student.rank <= 3 ? 'default' : 'secondary'}>
                            Rank #{student.rank}
                          </Badge>
                        </div>
                        <p className="text-gray-600">Kelas {student.class}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">
                        {student.score.toFixed(2)}%
                      </div>
                      <p className="text-sm text-gray-500">Skor AHP</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-700">Akademik</div>
                      <div className="text-lg font-bold text-blue-900">{student.criteria.academic}</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-700">Perilaku</div>
                      <div className="text-lg font-bold text-green-900">{student.criteria.behavior}</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm font-medium text-purple-700">Prestasi</div>
                      <div className="text-lg font-bold text-purple-900">{student.criteria.achievement}</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-sm font-medium text-orange-700">Kepemimpinan</div>
                      <div className="text-lg font-bold text-orange-900">{student.criteria.leadership}</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-sm font-medium text-red-700">Kehadiran</div>
                      <div className="text-lg font-bold text-red-900">{student.criteria.attendance}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Hasil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg text-white">
              <Trophy className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold">Juara 1</h3>
              <p className="text-lg">{results[0].name}</p>
              <p className="text-sm opacity-90">Skor: {results[0].score.toFixed(2)}%</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-r from-gray-300 to-gray-500 rounded-lg text-white">
              <Medal className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold">Juara 2</h3>
              <p className="text-lg">{results[1].name}</p>
              <p className="text-sm opacity-90">Skor: {results[1].score.toFixed(2)}%</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg text-white">
              <Award className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold">Juara 3</h3>
              <p className="text-lg">{results[2].name}</p>
              <p className="text-sm opacity-90">Skor: {results[2].score.toFixed(2)}%</p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">Interpretasi Hasil:</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Siswa dengan skor AHP tertinggi memiliki performa terbaik secara keseluruhan</li>
              <li>• Bobot kriteria: Akademik (35%), Perilaku (25%), Prestasi (20%), Kepemimpinan (12%), Kehadiran (8%)</li>
              <li>• Hasil ini dapat digunakan sebagai dasar pemilihan siswa berprestasi</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RankingResults;

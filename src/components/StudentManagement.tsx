
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';

interface Student {
  id: string;
  name: string;
  nis: string;
  class: string;
  scores?: {[criteriaName: string]: number};
}

interface Criteria {
  id: string;
  name: string;
}

const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    nis: '',
    class: '',
    scores: {} as {[key: string]: string}
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch students and criteria in parallel
      const [studentsResponse, criteriaResponse, scoresResponse] = await Promise.all([
        apiClient.getStudents(),
        apiClient.getCriteria(),
        apiClient.getStudentScores()
      ]);

      if (studentsResponse.success) {
        const studentsData = studentsResponse.data || [];
        const criteriaData = criteriaResponse.data || [];
        const scoresData = scoresResponse.data || [];

        // Map scores to students
        const studentsWithScores = studentsData.map((student: Student) => {
          const studentScores: {[criteriaName: string]: number} = {};
          
          criteriaData.forEach((criterion: Criteria) => {
            const score = scoresData.find((s: any) => 
              s.student_id === student.id && s.criteria_id === criterion.id
            );
            studentScores[criterion.name] = score ? score.score : 0;
          });

          return {
            ...student,
            scores: studentScores
          };
        });

        setStudents(studentsWithScores);
        setCriteria(criteriaData);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data siswa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const studentData = {
        name: formData.name,
        nis: formData.nis,
        class: formData.class
      };

      let response;
      if (editingId) {
        response = await apiClient.updateStudent(editingId, studentData);
      } else {
        response = await apiClient.createStudent(studentData);
      }

      if (response.success) {
        // Save scores
        const studentId = editingId || response.data?.id;
        if (studentId) {
          const scores = criteria.map(criterion => ({
            student_id: studentId,
            criteria_id: criterion.id,
            score: Number(formData.scores[criterion.name]) || 0
          }));

          await apiClient.saveStudentScores(scores);
        }

        toast({
          title: editingId ? "Data Diperbarui" : "Data Ditambahkan",
          description: editingId ? "Data siswa berhasil diperbarui" : "Data siswa baru berhasil ditambahkan",
        });

        fetchData();
        resetForm();
        setIsDialogOpen(false);
      }
    } catch (error: any) {
      console.error('Error saving student:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan data siswa",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nis: '',
      class: '',
      scores: {}
    });
    setEditingId(null);
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    
    const scores: {[key: string]: string} = {};
    criteria.forEach(criterion => {
      scores[criterion.name] = student.scores?.[criterion.name]?.toString() || '';
    });

    setFormData({
      name: student.name,
      nis: student.nis,
      class: student.class,
      scores
    });
    
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await apiClient.deleteStudent(id);
      
      if (response.success) {
        setStudents(students.filter(s => s.id !== id));
        toast({
          title: "Data Dihapus",
          description: "Data siswa berhasil dihapus",
        });
      }
    } catch (error: any) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus data siswa",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manajemen Data Siswa</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Siswa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Edit Data Siswa' : 'Tambah Data Siswa'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nis">NIS</Label>
                  <Input
                    id="nis"
                    value={formData.nis}
                    onChange={(e) => setFormData({...formData, nis: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="class">Kelas</Label>
                  <Input
                    id="class"
                    value={formData.class}
                    onChange={(e) => setFormData({...formData, class: e.target.value})}
                    required
                  />
                </div>
                
                {criteria.length > 0 && (
                  <div className="space-y-2">
                    <Label>Nilai Kriteria</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {criteria.map((criterion) => (
                        <div key={criterion.id}>
                          <Label htmlFor={criterion.name} className="text-sm">{criterion.name}</Label>
                          <Input
                            id={criterion.name}
                            type="number"
                            min="0"
                            max="100"
                            value={formData.scores[criterion.name] || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              scores: { ...formData.scores, [criterion.name]: e.target.value }
                            })}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button type="submit" className="w-full">
                  {editingId ? 'Update' : 'Simpan'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>NIS</TableHead>
                  <TableHead>Kelas</TableHead>
                  {criteria.map(criterion => (
                    <TableHead key={criterion.id}>{criterion.name}</TableHead>
                  ))}
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4 + criteria.length} className="text-center py-6 text-gray-500">
                      Belum ada data siswa. Klik "Tambah Siswa" untuk menambahkan data.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.nis}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      {criteria.map(criterion => (
                        <TableCell key={criterion.id}>
                          {student.scores?.[criterion.name] || '-'}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(student.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;

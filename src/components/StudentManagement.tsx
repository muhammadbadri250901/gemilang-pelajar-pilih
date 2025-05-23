
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Student {
  id: number;
  name: string;
  nis: string;
  class: string;
  academicScore: number;
  behaviorScore: number;
  achievementScore: number;
  leadershipScore: number;
  attendanceScore: number;
}

const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: 'Ahmad Rizki',
      nis: '001234567',
      class: '9A',
      academicScore: 85,
      behaviorScore: 90,
      achievementScore: 75,
      leadershipScore: 80,
      attendanceScore: 95
    },
    {
      id: 2,
      name: 'Siti Nurhaliza',
      nis: '001234568',
      class: '9B',
      academicScore: 92,
      behaviorScore: 88,
      achievementScore: 85,
      leadershipScore: 90,
      attendanceScore: 96
    },
    {
      id: 3,
      name: 'Budi Santoso',
      nis: '001234569',
      class: '9A',
      academicScore: 88,
      behaviorScore: 85,
      achievementScore: 70,
      leadershipScore: 85,
      attendanceScore: 92
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    nis: '',
    class: '',
    academicScore: '',
    behaviorScore: '',
    achievementScore: '',
    leadershipScore: '',
    attendanceScore: ''
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const studentData = {
      name: formData.name,
      nis: formData.nis,
      class: formData.class,
      academicScore: Number(formData.academicScore),
      behaviorScore: Number(formData.behaviorScore),
      achievementScore: Number(formData.achievementScore),
      leadershipScore: Number(formData.leadershipScore),
      attendanceScore: Number(formData.attendanceScore)
    };

    if (editingId) {
      setStudents(students.map(s => 
        s.id === editingId ? { ...studentData, id: editingId } : s
      ));
      toast({
        title: "Data Diperbarui",
        description: "Data siswa berhasil diperbarui",
      });
    } else {
      const newStudent = {
        ...studentData,
        id: Math.max(...students.map(s => s.id), 0) + 1
      };
      setStudents([...students, newStudent]);
      toast({
        title: "Data Ditambahkan",
        description: "Data siswa baru berhasil ditambahkan",
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nis: '',
      class: '',
      academicScore: '',
      behaviorScore: '',
      achievementScore: '',
      leadershipScore: '',
      attendanceScore: ''
    });
    setEditingId(null);
  };

  const handleEdit = (student: Student) => {
    setFormData({
      name: student.name,
      nis: student.nis,
      class: student.class,
      academicScore: student.academicScore.toString(),
      behaviorScore: student.behaviorScore.toString(),
      achievementScore: student.achievementScore.toString(),
      leadershipScore: student.leadershipScore.toString(),
      attendanceScore: student.attendanceScore.toString()
    });
    setEditingId(student.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setStudents(students.filter(s => s.id !== id));
    toast({
      title: "Data Dihapus",
      description: "Data siswa berhasil dihapus",
    });
  };

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
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="academic">Nilai Akademik</Label>
                    <Input
                      id="academic"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.academicScore}
                      onChange={(e) => setFormData({...formData, academicScore: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="behavior">Nilai Perilaku</Label>
                    <Input
                      id="behavior"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.behaviorScore}
                      onChange={(e) => setFormData({...formData, behaviorScore: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="achievement">Nilai Prestasi</Label>
                    <Input
                      id="achievement"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.achievementScore}
                      onChange={(e) => setFormData({...formData, achievementScore: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="leadership">Nilai Kepemimpinan</Label>
                    <Input
                      id="leadership"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.leadershipScore}
                      onChange={(e) => setFormData({...formData, leadershipScore: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="attendance">Nilai Kehadiran</Label>
                  <Input
                    id="attendance"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.attendanceScore}
                    onChange={(e) => setFormData({...formData, attendanceScore: e.target.value})}
                    required
                  />
                </div>
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
                  <TableHead>Akademik</TableHead>
                  <TableHead>Perilaku</TableHead>
                  <TableHead>Prestasi</TableHead>
                  <TableHead>Kepemimpinan</TableHead>
                  <TableHead>Kehadiran</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.nis}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>{student.academicScore}</TableCell>
                    <TableCell>{student.behaviorScore}</TableCell>
                    <TableCell>{student.achievementScore}</TableCell>
                    <TableCell>{student.leadershipScore}</TableCell>
                    <TableCell>{student.attendanceScore}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;

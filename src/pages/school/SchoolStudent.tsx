import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Plus, Eye } from "lucide-react";
import CreateStudentModal from "../../components/school/school-studentModal";
import StudentDetailModal from "../../components/school/school-student-detail-modal";
import DataTable from "../../components/school/data-table";
import { toast } from "sonner";
import API from "../../lib/axios";
import useFetchData from "../../hooks/useFetchData";

export interface Enrollment {
  termId: string;
  classroomId: string;
}

export type StudentStatus = "active" | "inactive";

export interface StudentType {
  _id: string; // ✅ Matches MongoDB _id
  name: string;
  firstName?: string;
  lastName?: string;
  dob?: string; // ISO format string like "2025-06-19"
  address?: string;
  profileUrl?: string;
  parentPhone: string;
  sex?: "male" | "female";
  status?: StudentStatus;
  classroomId?: string; // current classroomId
  termId?: string; // current termId
  enrollments: Enrollment[];
  createdAt: string; // ISO string from MongoDB
}

export default function SchoolStudent() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentType>(); // Using any for compatibility with CreateStudentModal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [students, setStudents] = useState<StudentType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await API.get("/students");
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);


  // Temporary adapter for CreateStudentModal compatibility
  const adaptStudentForEdit = (student: StudentType) => {
    const firstEnrollment = student.enrollments?.[0];
    return {
      _id: student._id,
      name: student.name,
      firstName: student.firstName,
      lastName: student.lastName,
      dob: student.dob,
      address: student.address,
      profileUrl: student.profileUrl,
      parentPhone: student.parentPhone,
      status: student.status,
      enrollments: student.enrollments || [],
      classroomId: firstEnrollment?.classroomId || "",
      termId: firstEnrollment?.termId || "",
      createdAt: student.createdAt,
    };
  };

  const handleEditStudent = (student: StudentType) => {
    setEditingStudent(adaptStudentForEdit(student));
    setIsCreateModalOpen(true);
  };

  const handleViewStudent = (student: StudentType) => {
    setEditingStudent(adaptStudentForEdit(student));
    setIsDetailModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    setEditingStudent(undefined);
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
  };

  const handleCreateSuccess = () => {
    fetchStudents();
  };

  if (loading) return <p>Loading students...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">👨‍🎓 Students</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>
      <DataTable
        data={students || []}
        title="Students"
        columns={[
          { label: "Name", key: "name" },
          { label: "Sex", key: "sex" },
          { label: "DOB", key: "dob" },
          { label: "Parent Phone", key: "parentPhone" },
          { label: "Status", key: "status" },
          // { label: "Created", key: "createdAt" },
        ]}
        actions={(student) => (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewStudent(student)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditStudent(student)}
            >
              Edit
            </Button>
          </div>
        )}
      />

      <CreateStudentModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        initialData={editingStudent}
        onSuccess={handleCreateSuccess}
      />

      <StudentDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
        selectedStudent={editingStudent}
      />
    </div>
  );
}
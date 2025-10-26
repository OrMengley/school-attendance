
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Plus, Eye } from "lucide-react";
import CreateStudentModal from "../../components/school/school-studentModal";
import StudentDetailModal from "../../components/school/school-student-detail-modal";
import DataTable from "../../components/school/data-table";
import { toast } from "sonner";
import API from "../../lib/axios";
import type { StudentType } from "../../types/Student";
import { useUser } from "../../context/UserContext"




export default function SchoolStudent() {
  const { user } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentType>(); // Using any for compatibility with CreateStudentModal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudentView, setSelectedStudentView] = useState<StudentType>();
  const [students, setStudents] = useState<StudentType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/students/school/${user?.school_id}`);
      // Add null check for response data like SchoolClassroom
      if (response.data && Array.isArray(response.data)) {
        setStudents(response.data);
      } else {
        console.warn("Invalid students data received:", response.data);
        setStudents([]);
        toast.error("Invalid data format received");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
      setStudents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Temporary adapter for CreateStudentModal compatibility
  const adaptStudentForEdit = (student: StudentType) => {
    if (!student) {
      console.warn("Attempted to adapt null/undefined student");
      return null;
    }

    const firstEnrollment = student.enrollments?.[0];
    return {
      _id: student._id || '',
      name: student.name || '',
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      dob: student.dob || '',
      address: student.address || '',
      profileUrl: student.profileUrl || '',
      parentPhone: student.parentPhone || '',
      status: student.status || 'active',
      enrollments: student.enrollments || [],
      classroom_id: firstEnrollment?.classroom_id || "",
      term_id: firstEnrollment?.term_id || "",
      createdAt: student.createdAt || new Date().toISOString(),
    };
  };

  const handleEditStudent = (student: StudentType) => {
    if (!student) {
      toast.error("Invalid student data");
      return;
    }
    
    const adaptedStudent = adaptStudentForEdit(student);
    if (adaptedStudent) {
      setEditingStudent(adaptedStudent);
      setIsCreateModalOpen(true);
    } else {
      toast.error("Failed to process student data");
    }
  };

  const handleViewStudent = (student: StudentType) => {
    if (!student) {
      toast.error("Invalid student data");
      return;
    }
    setIsDetailModalOpen(true);
    setSelectedStudentView(student);

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
        key={students?.length}
        data={students?.map((student) => {
          if (!student) {
            console.warn("Found null/undefined student in array");
            return null;
          }
          
          return ({
            ...student,
            classroomName: student.classroom?.name || 'No Classroom',
            termName: student.term?.year || 'No Term',
            key: student._id || `student-${Math.random()}`,
            // Add null checks for all fields like SchoolClassroom
            name: student.name || 'Unnamed Student',
            sex: student.sex || 'Not specified',
            dob: student.dob || 'Not specified',
            parentPhone: student.parentPhone || 'No phone',
            status: student.status || 'active',
          } as StudentType & { classroomName: string; termName: string; key: string });
        }).filter((student): student is StudentType & { classroomName: string; termName: string; key: string } => student !== null) || []}
        title="Students"
        columns={[
          { label: "ឈ្មោះសិក្សា", key: "name" },
          { label: "Sex", key: "sex" },
          { label: "DOB", key: "dob" },
          { label: "បន្ទប់សិក្សា", key: "classroomName" },
          { label: "Parent Phone", key: "parentPhone" },
          { label: "Status", key: "status" },
        ]}
        actions={(student) => {
          if (!student) {
            return <div>Invalid student data</div>;
          }
          
          return (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleViewStudent(student);
                  console.log("student", student.classroom?.name);
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleEditStudent(student);
                  
                }}
              >
                Edit
              </Button>
            </div>
          );
        }}
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
        selectedStudent={selectedStudentView}
      />
    </div>
  );
}
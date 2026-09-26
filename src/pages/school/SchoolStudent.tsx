import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Plus, Eye, Edit, BookOpenCheck } from "lucide-react";
import CreateStudentModal from "../../components/school/school-studentModal";
import DataTable from "../../components/school/data-table";
import { toast } from "sonner";
import API from "../../lib/axios";
import type { StudentType } from "../../types/Student";
import { useUser } from "../../context/UserContext";

export default function SchoolStudent() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentType>();

  const [students, setStudents] = useState<StudentType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/students/school/${user?.school_id}`);
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
      setStudents([]);
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
      _id: student._id || "",
      name: student.name || "",
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      dob: student.dob || "",
      address: student.address || "",
      profileUrl: student.profileUrl || "",
      parentPhone: student.parentPhone || "",
      status: student.status || "active",
      enrollments: student.enrollments || [],
      classroom_id: firstEnrollment?.classroom_id || student.classroom_id || "",
      term_id: firstEnrollment?.term_id || student.term_id || "",
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
    if (!student || !student._id) {
      toast.error("Invalid student data");
      return;
    }
    navigate(`/school/student/${student._id}`);
  };

  const handleViewEnrollment = (student: StudentType) => {
    if (!student || !student._id) {
      toast.error("Invalid student data");
      return;
    }
    navigate(`/school/student/${student._id}/enrollment`);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    setEditingStudent(undefined);
  };

  const handleSuccess = () => {
    fetchStudents();
  };

  if (loading) return <p className="p-4 text-sm text-muted-foreground">Loading students...</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">👨‍🎓 សិស្ស (Students)</h1>
          <p className="text-xs text-muted-foreground">គ្រប់គ្រងបញ្ជីសិស្ស និងការចុះឈ្មោះចូលរៀន</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/school/enrollment")}
            className="gap-1.5 text-xs h-9"
          >
            <BookOpenCheck className="h-4 w-4 text-primary" />
            <span>ទំព័រចុះឈ្មោះ (Enrollment Page)</span>
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-1.5 text-xs h-9">
            <Plus className="h-4 w-4" />
            <span>បន្ថែមសិស្ស (Add Student)</span>
          </Button>
        </div>
      </div>

      <DataTable
        key={students?.length}
        data={
          students
            ?.map((student) => {
              if (!student) {
                console.warn("Found null/undefined student in array");
                return null;
              }

              return ({
                ...student,
                classroomName: student.classroom?.name || "No Classroom",
                termName: student.term?.year || "No Term",
                key: student._id || `student-${Math.random()}`,
                name: student.name || "Unnamed Student",
                sex: student.sex === "female" ? "ស្រី" : student.sex === "male" ? "ប្រុស" : "Not specified",
                dob: student.dob || "Not specified",
                parentPhone: student.parentPhone || "No phone",
                status: student.status || "active",
              } as unknown) as StudentType & { classroomName: string; termName: string; key: string };
            })
            .filter(
              (student): student is StudentType & { classroomName: string; termName: string; key: string } =>
                student !== null
            ) || []
        }
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
            <div className="flex items-center space-x-1.5">
              {/* View Enrollment Action Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewEnrollment(student)}
                className="h-8 px-2.5 text-xs text-primary border-primary/25 hover:bg-primary/10 transition-colors"
                title="មើលការចុះឈ្មោះចូលរៀន (View Enrollment)"
              >
                <BookOpenCheck className="h-3.5 w-3.5 mr-1" />
                <span>Enrollment</span>
              </Button>

              {/* View Student Profile Action Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewStudent(student)}
                className="h-8 px-2.5 text-xs"
                title="មើលព័ត៌មានលម្អិត (View Details)"
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                <span>View</span>
              </Button>

              {/* Edit Student Action Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditStudent(student)}
                className="h-8 px-2.5 text-xs"
                title="កែប្រែព័ត៌មាន (Edit Student)"
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                <span>Edit</span>
              </Button>
            </div>
          );
        }}
      />

      <CreateStudentModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        initialData={editingStudent}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
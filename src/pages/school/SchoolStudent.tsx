import { useState, useEffect } from "react";


interface StudentType {
  _id: string;
  name: string;
  email: string;
  classroomId: string;
  enrollmentDate: string;
  status: "active" | "inactive";
}

export default function SchoolStudent() {
  // const [students, setStudents] = useState<Student[]>([]);
  const [loading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    
  }, []);

  // const handleDeleteStudents = async (ids: string[]) => {
  //   try {
  //     // In a real application, you would call your API to delete the students
  //     // Example: await axios.delete("/students", { data: { ids } });
      
  //     console.log("Deleting students with IDs:", ids);
  //     toast.success(`Successfully deleted ${ids.length} student(s)`);
      
  //     // Update local state after deletion
  //     setStudents(prevStudents => prevStudents.filter(student => !ids.includes(student.id)));
  //   } catch (error) {
  //     console.error("Error deleting students:", error);
  //     toast.error("Failed to delete students");
  //   }
  // };

  // const refetch = () => {
  //   // In a real app, this would fetch fresh data
  //   setLoading(true);
  //   setTimeout(() => setLoading(false), 500);
  // };

  if (loading) return <p>Loading students...</p>;

  return (
    // <DataTable
    //   data={students}
    //   title="👨‍🎓 Students"
    //   columns={[
    //     { label: "Name", key: "name" },
    //     { label: "Email", key: "email" },
    //     { label: "Classroom", key: "classroomId" },
    //     { label: "Enrollment Date", key: "enrollmentDate" },
    //     { label: "Status", key: "status" },
    //   ]}
    //   onDelete={handleDeleteStudents}
    // />
    <div>
      <h1>Students</h1>
    </div>
  );
}
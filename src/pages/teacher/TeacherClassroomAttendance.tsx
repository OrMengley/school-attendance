import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../lib/axios";
import { toast } from "sonner";
import useFetchData from "../../hooks/useFetchData";


interface ClassroomType {
  _id: string;
  name: string;
  termId: string;
}

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

export default function TeacherClassroomAttendance() {
  const { id: classroomId } = useParams();
  const [students, setStudents] = useState<StudentType[]>([]);
  const teacherId = "CURRENT_TEACHER_ID"; // Replace with actual auth context
  const [currentClassroom, setCurrentClassroom]= useState<ClassroomType>();
  
  
  useEffect(() => {
    API.get(`/classrooms/${classroomId}`).then((res)=>{
      setCurrentClassroom(res.data);
    }).catch((err)=>{
      console.log(err);
    })

    const fetchStudents = async () => {

        const res = await API.get(`/students/classroom/${classroomId}/term/${currentClassroom?.termId}`);
      setStudents(res.data);
    };
    fetchStudents();
  }, []);

  const handleAttendance = async (studentId: string, status: "checkin" | "checkout") => {
    await API.post("/attendance/check", {
      studentId,
      classroomId,
      teacherId,
      status,
    });
    toast.success(`${status === "checkin" ? "Checked in" : "Checked out"} successfully`);
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Attendance</h1>
      <div className="space-y-3">
      {students && students.length > 0 ? (
  students.map((s: StudentType) => (
    <div
      key={s._id}
      className="bg-white rounded-lg shadow p-3 flex items-center justify-between"
    >
      <div>
        <p className="font-medium">{s.name || "អនាមិក"}</p>
      </div>
      <div className="flex gap-2">
        <button
          className="bg-green-500 text-white px-3 py-1 rounded"
          onClick={() => handleAttendance(s._id, "checkin")}
        >
          In
        </button>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded"
          onClick={() => handleAttendance(s._id, "checkout")}
        >
          Out
        </button>
      </div>
    </div>
  ))
) : (
  <p className="text-gray-500 text-sm">គ្មានសិស្ស</p>
)}
      </div>
    </div>
  );
}
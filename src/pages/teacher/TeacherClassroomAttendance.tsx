import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import API from "../../lib/axios";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { KeenIcon } from "../../components/ui/keenicon";

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
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  address?: string;
  profileUrl?: string;
  parentPhone: string;
  sex?: "male" | "female";
  status?: StudentStatus;
  classroomId?: string;
  termId?: string;
  enrollments: Enrollment[];
  createdAt: string;
}
type AttendanceStatus = "none" | "checkin" | "checkout";

interface Props {
  // sessionId?: string; // ✅ Pass sessionId as a prop
}

export default function TeacherClassroomAttendance({  }: Props) {
  const location = useLocation();
  const sessionId = location.state?.sessionId;
  const { id: classroomId } = useParams();
  const [students, setStudents] = useState<StudentType[]>([]);
  const [currentClassroom, setCurrentClassroom] = useState<ClassroomType>();
  const teacher = JSON.parse(localStorage.getItem("user") || "{}");
  const teacherId = teacher?.id || ""; // ✅ Get from localStorage (must match your user schema)
  const [attendanceMap, setAttendanceMap] = useState<Map<string, AttendanceStatus>>(new Map());
   // ⏳ Fetch students & classroom info
   useEffect(() => {
    API.get(`/classrooms/${classroomId}`).then((res) => setCurrentClassroom(res.data));
  }, [classroomId]);

  useEffect(() => {
    if (!classroomId || !currentClassroom?.termId) return;

    const fetchStudents = async () => {
      const res = await API.get(`/students/classroom/${classroomId}/term/${currentClassroom.termId}`);
      setStudents(res.data);
    };

    const fetchAttendance = async () => {
      const res = await API.get(`/attendance/session/${sessionId}`);
      const statusMap = new Map<string, AttendanceStatus>();
      for (const a of res.data) {
        statusMap.set(a.studentId, a.status);
      }
      setAttendanceMap(statusMap);
    };

    fetchStudents();
    fetchAttendance();
  }, [classroomId, currentClassroom?.termId, sessionId]);

  // 🖱 Handle check-in/out
  const handleAttendance = async (studentId: string, status: "checkin" | "checkout") => {
    try {
      await API.post("/attendance/check", {
        studentId,
        classroomId,
        teacherId,
        sessionId,
        status,
      });

      setAttendanceMap((prev) => {
        const updated = new Map(prev);
        updated.set(studentId, status);
        return updated;
      });

      toast.success(`${status === "checkin" ? "Checked in" : "Checked out"} successfully`);
    } catch (err) {
      toast.error("Failed to submit attendance");
    }
  };

  return (
    <div className="p-4">
      <div className="flex  items-center mb-4">
      <Button variant="default"
          onClick={() => window.history.back()} 
          // className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          ត្រឡប់ក្រោយ
        </Button>
                 <h1 className="text-lg font-bold ml-4 flex items-center gap-2">
           <KeenIcon name="abstract-1" size="lg" className="text-blue-600" />
           ចុះបញ្ជីវត្តមានសិស្ស
         </h1>
        
      </div>
      <div className="space-y-3">
        {students.length > 0 ? (
          students.map((s) => {
            const status = attendanceMap.get(s._id) || "none";
            return (
              <div
                key={s._id}
                className="bg-white rounded-lg shadow p-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{s.name || "អនាមិក"}</p>
                </div>
                <div className="flex gap-2">
                                     <button
                     className="bg-green-500 text-white px-3 py-1 rounded disabled:opacity-50 flex items-center gap-1"
                     onClick={() => handleAttendance(s._id, "checkin")}
                     disabled={status !== "none"}
                   >
                     <KeenIcon name="check" size="sm" />
                     ចូល
                   </button>
                   <button
                     className="bg-red-500 text-white px-3 py-1 rounded disabled:opacity-50 flex items-center gap-1"
                     onClick={() => handleAttendance(s._id, "checkout")}
                     disabled={status !== "checkin"}
                   >
                     <KeenIcon name="cross" size="sm" />
                     ចេញ
                   </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-sm">គ្មានសិស្ស</p>
        )}
      </div>
    </div>
  );
}
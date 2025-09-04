import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import API from "../../lib/axios";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { KeenIcon } from "../../components/ui/keenicon";
import type {StudentType} from "../../types/Student";
import type {ClassroomType} from "../../types/Classroom";







type AttendanceStatus = "none" | "checkin" | "checkout";


export default function TeacherClassroomAttendance() {
  const location = useLocation();
  const session_id = location.state?.sessionId || location.state?.session_id;
  const { id: classroom_id } = useParams();
  const [students, setStudents] = useState<StudentType[]>([]);
  const [currentClassroom, setCurrentClassroom] = useState<ClassroomType>();
  const teacher = JSON.parse(localStorage.getItem("user") || "{}");
  const teacher_id: string = teacher?.id || teacher?._id || ""; // support id or _id
  const [attendanceMap, setAttendanceMap] = useState<Map<string, AttendanceStatus>>(new Map());
   // ⏳ Fetch students & classroom info
   useEffect(() => {
    
    API.get(`/classrooms/${classroom_id}`).then((res) => setCurrentClassroom(res.data));
  }, [classroom_id]);

  useEffect(() => {
    if (!classroom_id || !currentClassroom?.term_id) return;

    const fetchStudents = async () => {
      const res = await API.get(`/students/classroom/${classroom_id}/term/${currentClassroom.term_id}`);
      setStudents(res.data);
    };

    const fetchAttendance = async () => {
      const res = await API.get(`/attendance/session/${session_id}`);
      const statusMap = new Map<string, AttendanceStatus>();
      for (const a of res.data) {
        statusMap.set(a.student_id, a.status);
      }
      setAttendanceMap(statusMap);
    };

    fetchStudents();
    fetchAttendance();
  }, [classroom_id, currentClassroom?.term_id, session_id]);

  // 🖱 Handle check-in/out
  const handleAttendance = async (student_id: string, status: "checkin" | "checkout") => {
    try {
      if (!teacher_id) {
        toast.error("Missing teacher ID");
        return;
      }
      if (!session_id) {
        toast.error("Missing session ID");
        return;
      }
      await API.post("/attendance/check", {
        student_id: student_id,
        classroom_id: classroom_id,
        session_id: session_id,
        teacher_id: teacher_id,
        status: status,
      });
      setAttendanceMap((prev) => {
        const updated = new Map(prev);
        updated.set(student_id, status);
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
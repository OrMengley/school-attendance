import { useEffect, useState } from "react";
import API from "../lib/axios";
import type { ClassroomType } from "../types/Classroom";
import type { StudentType } from "../types/Student";
// import { useUser } from "../context/UserContext";


export default function AttendancePage() {
  // const { user } = useUser();
  const [classrooms, setClassrooms] = useState<ClassroomType[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [students, setStudents] = useState<StudentType[]>([]);
  const [loading, setLoading] = useState(false);
  // const [terms, setTerms] = useState<any[]>([]);
  // const fetchTerms = async () => {
  //           try {
  //               const res = await API.get(`/terms?school_id=${user?.school_id}`);
  //               console.log("Terms data:", res.data);
  //               if (res.data && Array.isArray(res.data)) {
  //                   setTerms(res.data);
  //               }
  //           } catch (error) {
  //               console.error("Error fetching terms:", error);
  //               setTerms([]);
  //           }
  //       };`
  useEffect(() => {
    // fetchTerms();
    API.get("/classrooms")
      .then((res) => setClassrooms(res.data))
      .catch(() => alert("Failed to fetch classrooms"));
  }, []);

  useEffect(() => {
    if (!selectedClassroom) return;
    setLoading(true);
    API.get("/students") // fetch all and filter (until API supports ?classroomId=...)
      .then((res) => {
        const filtered = res.data.filter((s: StudentType) => s.classroom_id === selectedClassroom);
        setStudents(filtered);
      })
      .catch(() => alert("Failed to fetch students"))
      .finally(() => setLoading(false));
  }, [selectedClassroom]);

  const markAttendance = async (studentId: string, status: "checkin" | "checkout") => {
    try {
      await API.post("/attendance", { studentId, status });
      alert(`✅ ${status.toUpperCase()} recorded for student`);
    } catch (err) {
      alert("Failed to mark attendance");
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Student Attendance</h2>

      <select
        className="border p-2 mb-4"
        value={selectedClassroom}
        onChange={(e) => setSelectedClassroom(e.target.value)}
      >
        <option value="">Select Classroom</option>
        {classrooms.map((c) => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>

      {loading ? (
        <p>Loading students...</p>
      ) : (
        <div className="space-y-3">
          {students.map((student) => (
            <div key={student._id} className="border p-3 rounded shadow-sm flex justify-between items-center">
              <div>
                <p className="font-semibold">{student.name}</p>
                <p className="text-sm text-gray-500">Parent: {student.parentPhone}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => markAttendance(student._id, "checkin")}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Check-in
                </button>
                <button
                  onClick={() => markAttendance(student._id, "checkout")}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Check-out
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
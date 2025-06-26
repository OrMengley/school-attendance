import { useEffect, useState } from "react";
import API from "../lib/axios";

interface Classroom {
  _id: string;
  name: string;
}

interface Student {
  _id: string;
  name: string;
  parentPhone: string;
  classroomId: string;
}

export default function AttendancePage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/classrooms")
      .then((res) => setClassrooms(res.data))
      .catch(() => alert("Failed to fetch classrooms"));
  }, []);

  useEffect(() => {
    if (!selectedClassroom) return;
    setLoading(true);
    API.get("/students") // fetch all and filter (until API supports ?classroomId=...)
      .then((res) => {
        const filtered = res.data.filter((s: Student) => s.classroomId === selectedClassroom);
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
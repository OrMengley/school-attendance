import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import useFetchData from "../../hooks/useFetchData";
import API from "../../lib/axios";
import { toast } from "sonner";
import type { UserType } from "../../types/User";
const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];
// interface TeacherType {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   schoolId?: string;
//   classroomIds:string[];
// }

interface DaySessionInputType {
  sessionDay: string;
  subjectName: string;
  teacher_id: string;
  sessionStartHour: string;
  sessionStartMin: string;
  sessionEndHour: string;
  sessionEndMin: string;
  sessionStatus?: "active" | "close";
}

interface DaySessions {
  qty: number;
  sessions: DaySessionInputType[];
}

interface SchoolClassroomSessionModalProps {
    isOpenCreateSession: boolean;
    onCloseCreateSession: () => void;
    classroom_id: string;
    
  }

export default function SchoolClassroomSessionModal({isOpenCreateSession,onCloseCreateSession,classroom_id: classroom_id}:SchoolClassroomSessionModalProps) {
  const {data:teachers} = useFetchData<UserType>("/users?role=teacher");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [dayInputs, setDayInputs] = useState<Record<string, DaySessions>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<DaySessionInputType[]>([]);

  // Handle day selection
  const handleDayToggle = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
    // Initialize input for new day
    if (!dayInputs[day]) {
      setDayInputs(inputs => ({
        ...inputs,
        [day]: {
          qty: 1,
          sessions: [
            {  subjectName: "", teacher_id: "", sessionStartHour: "", sessionStartMin: "", sessionEndHour: "", sessionEndMin: "", sessionDay: day, sessionStatus: "active" }
          ]
        }
      }));
    }
  };

  // Handle qty change for a day
  const handleQtyChange = (day: string, qty: number) => {
    setDayInputs(inputs => {
      const prevSessions = inputs[day]?.sessions || [];
      let newSessions = prevSessions.slice(0, qty);
      while (newSessions.length < qty) {
        newSessions.push({ sessionDay: day, subjectName: "", teacher_id: "", sessionStartHour: "", sessionStartMin: "", sessionEndHour: "", sessionEndMin: "", sessionStatus: "active" });
      }
      return {
        ...inputs,
        [day]: {
          qty,
          sessions: newSessions
        }
      };
    });
  };

  // Handle input change for a session in a day
  const handleSessionInputChange = (day: string, idx: number, field: keyof DaySessionInputType, value: string) => {
    setDayInputs(inputs => {
      const sessions = [...(inputs[day]?.sessions || [])];
      sessions[idx] = { ...sessions[idx], [field]: value };
      return {
        ...inputs,
        [day]: {
          ...inputs[day],
          sessions
        }
      };
    });
  };
  
  const handleFetchSessions = async () => {
    if (!classroom_id) return;
    try {
      const response = await API.get(`/classrooms/${classroom_id}/sessions`);
      if (Array.isArray(response.data)) {
        setSessions(response.data);
        console.log("sessions", sessions);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  };

  // Clear all
  const handleClearSession = () => {
    setSelectedDays([]);
    setDayInputs({});
  };

  // Handle create session(s)
  const handleCreateSession = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build new sessions from all days
      const newSessions = selectedDays.flatMap(day =>
        (dayInputs[day]?.sessions || []).map(session => ({
          subjectName: session.subjectName,
          teacher_id: session.teacher_id,
          sessionStartHour: session.sessionStartHour,      // <-- use correct field name
          sessionStartMin: session.sessionStartMin,        // <-- use correct field name
          sessionEndHour: session.sessionEndHour,          // <-- use correct field name
          sessionEndMin: session.sessionEndMin,            // <-- use correct field name
          sessionDay: day,                     // <-- use correct field name
          sessionStatus: session.sessionStatus || "active"  // Include session status
        }))
      );

      await API.post(`/classrooms/${classroom_id}/sessions`, newSessions);
      setLoading(false);
      handleClearSession();
      onCloseCreateSession();
      toast.success("Session(s) created successfully", {
        style: { background: "#10B981", color: "#FFFFFF" }
      });
      handleFetchSessions();
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || "Failed to create session(s)");
    }
  };
  useEffect(() => {
    handleFetchSessions();
  }, [isOpenCreateSession]);
  return (
    <Dialog open={isOpenCreateSession} onOpenChange={onCloseCreateSession}>
      <DialogContent className="2xl:max-w-6xl xl:max-w-5xl lg:max-w-4xl md:max-w-3xl sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>School Classroom Sessions</DialogTitle>
          <DialogDescription>
            Select days, input session quantity, and fill in session details for each.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4">
            <label className="block text-base font-semibold mb-2">Select Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <label key={day} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day)}
                    onChange={() => handleDayToggle(day)}
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {selectedDays.map(day => (
              <div key={day} className="border rounded-lg p-4 bg-gray-50 shadow">
                <h3 className="font-bold text-blue-700 mb-2">{day}</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Qty of Sessions</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="w-32 border rounded px-3 py-2"
                    value={dayInputs[day]?.qty || 1}
                    onChange={e => handleQtyChange(day, Math.max(1, Math.min(10, Number(e.target.value))))}
                  />
                </div>
                {(dayInputs[day]?.sessions || []).map((session, idx) => (
                  <div key={idx} className="mb-4 border rounded p-3 bg-white">
                    <div className="mb-2 font-semibold">Session {idx + 1}</div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium mb-1">Subject Name</label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        value={session.subjectName}
                        onChange={e => handleSessionInputChange(day, idx, "subjectName", e.target.value)}
                        required
                        placeholder="Enter subject name"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium mb-1">Teacher</label>
                      <select
                        className="w-full border rounded px-3 py-2"
                        value={session.teacher_id}
                        onChange={e => handleSessionInputChange(day, idx, "teacher_id", e.target.value)}
                        required
                      >
                        <option value="">Select teacher</option>
                        {teachers?.map(teacher => (
                          <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Start Hour</label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          className="w-full border rounded px-3 py-2"
                          value={session.sessionStartHour}
                          onChange={e => handleSessionInputChange(day, idx, "sessionStartHour", e.target.value)}
                          required
                          placeholder="HH"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Start Min</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          className="w-full border rounded px-3 py-2"
                          value={session.sessionStartMin}
                          onChange={e => handleSessionInputChange(day, idx, "sessionStartMin", e.target.value)}
                          required
                          placeholder="MM"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">End Hour</label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          className="w-full border rounded px-3 py-2"
                          value={session.sessionEndHour}
                          onChange={e => handleSessionInputChange(day, idx, "sessionEndHour", e.target.value)}
                          required
                          placeholder="HH"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">End Min</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          className="w-full border rounded px-3 py-2"
                          value={session.sessionEndMin}
                          onChange={e => handleSessionInputChange(day, idx, "sessionEndMin", e.target.value)}
                          required
                          placeholder="MM"
                        />
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium mb-1">Session Status</label>
                      <select
                        className="w-full border rounded px-3 py-2"
                        value={session.sessionStatus || "active"}
                        onChange={e => handleSessionInputChange(day, idx, "sessionStatus", e.target.value as "active" | "close")}
                        required
                      >
                        <option value="active">Active</option>
                        <option value="close">Close</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => {
            handleClearSession();
            onCloseCreateSession();
          }}>
            Cancel
          </Button>
          <Button type="button" onClick={handleCreateSession} disabled={loading || selectedDays.length === 0}>
            {loading ? "Saving..." : "Save"}
          </Button>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import { useEffect, useState, useRef } from "react";
import API from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import useFetchData from "../../hooks/useFetchData";
import {  Clock } from "lucide-react";
import SessionCard from "../../components/teacher/sessionCard";
import type { ClassroomType } from "../../types/Classroom";
import type { TermType } from "../../types/Term";
import { useUser } from "../../context/UserContext";


type FilterType = | "today" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export default function TeacherDashboard() {
    const { user } = useUser();
    const [classrooms, setClassrooms] = useState<ClassroomType[]>([]);
    const [studentsByClassroom, setStudentsByClassroom] = useState<Record<string,
        any[]>>({});
    const currentYear = new Date().getFullYear().toString();
    const { data: terms } = useFetchData<TermType>(`/terms?school_id=${user?.school_id}`);
    const [filter, setFilter] = useState<FilterType>("today");
    const refreshInterval = useRef<NodeJS.Timeout | null>(null);
    const DAY_LABELS: Record<string,
        string> = {
        today: "ថ្ងៃនេះ",
        monday: "ថ្ងៃចន្ទ",
        tuesday: "ថ្ងៃអង្គារ",
        wednesday: "ថ្ងៃពុធ",
        thursday: "ថ្ងៃព្រហស្បតិ៍",
        friday: "ថ្ងៃសុក្រ",
        saturday: "ថ្ងៃសៅរ៍",
        sunday: "ថ្ងៃអាទិត្យ"
    };

    const [selectedTermId, setSelectedTermId] = useState<string | "all">("all");

    const navigate = useNavigate();

    // Function to fetch classrooms and students data
    const fetchClassrooms = async () => {
        try {
            const res = await API.get("/classrooms?role=teacher");
            setClassrooms(res.data);

            // fetch students for each classroom
            const allStudents: Record<string,
                any[]> = {};
            for (const c of res.data) {
                try {
                    const studentsRes = await API.get(`/students/classroom/${c._id}/term/${c.termId}`);
                    allStudents[c._id] = studentsRes.data || [];
                } catch {
                    allStudents[c._id] = [];
                }
            }
            setStudentsByClassroom(allStudents);
            console.log("studentsByClassroom :", allStudents);
        } catch (error) {
            console.error("Error fetching classrooms:", error);
        }
    };

    useEffect(() => {
        if (terms && terms.length > 0) {
            const match = terms.find(t => t.year === currentYear);
            if (match) {
                setSelectedTermId(match._id);
            } else {
                setSelectedTermId("all"); // fallback if no matching term
            }
        }
        
        fetchClassrooms();
        
        // Set up interval to refresh data every minute (60,000 milliseconds)
        refreshInterval.current = setInterval(() => {
            fetchClassrooms();
        }, 60000);

        // Clean up interval on component unmount
        return () => {
            if (refreshInterval.current) {
                clearInterval(refreshInterval.current);
            }
        };
    },
        [terms]
    );

    // flatten all sessions with classroom info
    const allSessions = classrooms.flatMap((c) => Array.isArray(c.sessions) ? c.sessions.map((s) => ({
        ...s,
        _id: (s as any)._id,
        classroomName: c.name,
        classroom_id: c._id,
        term_id: c.term_id,
        year: terms?.find((t) => t._id === c.term_id)?.year
    })) : []);

    // const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

    const filteredSessions = allSessions.filter((s) => { // Filter by day
        if (filter === "today") {
            const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
            if (s.sessionDay !== todayName)
                return false;


        } else {
            if (s.sessionDay.toLowerCase() !== filter)
                return false;


        }

        // Filter by term
        if (selectedTermId !== "all" && s.year) {
            const sessionTerm_id = classrooms.find(c => c._id === s.classroom_id)?.term_id;
            if (sessionTerm_id !== selectedTermId)
                return false;

        }

        return true;
    });

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4 text-gray-800">
                ម៉ោងរៀនរបស់ខ្ញុំ
            </h1>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button onClick={
                    () => setFilter("today")
                }
                    className={
                        `px-3 py-1 rounded-full text-sm ${filter === "today" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                        }`
                    }>
                    {
                        DAY_LABELS["today"]
                    } </button>
                {
                    [
                        "monday",
                        "tuesday",
                        "wednesday",
                        "thursday",
                        "friday",
                        "saturday",
                        "sunday",
                    ].map((day) => (
                        <button key={day}
                            onClick={
                                () => setFilter(day as FilterType)
                            }
                            className={
                                `px-3 py-1 rounded-full text-sm ${filter === day ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                                }`
                            }>
                            {
                                DAY_LABELS[day]
                            } </button>
                    ))
                } </div>
            <div className="mb-4">
                <label htmlFor="termFilter" className="block text-sm font-medium text-gray-700 mb-1">
                    ជ្រើសរើសឆ្នាំសិក្សា
                </label>
                <select id="termFilter"
                    value={selectedTermId}
                    onChange={
                        (e) => setSelectedTermId(e.target.value)
                    }
                    className="w-full md:w-64 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500">
                    <option value="all">ទាំងអស់</option>
                    {
                        terms?.map((t) => (
                            <option key={
                                t._id
                            }
                                value={
                                    t._id
                                }>
                                {
                                    t.year
                                } </option>
                        ))
                    } </select>
            </div>

            {
                filteredSessions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <Clock className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600">គ្មានម៉ោងរៀន</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {
                            filteredSessions.map((s) => (
                                <SessionCard
                                    key={s._id}
                                    subjectName={s.subjectName}
                                    classroomName={s.classroomName}
                                    startHour={s.sessionStartHour}
                                    startMin={s.sessionStartMin}
                                    endHour={s.sessionEndHour}
                                    endMin={s.sessionEndMin}
                                    sessionDay={s.sessionDay}   // <-- add this
                                    students={studentsByClassroom[s.classroom_id] || []}
                                    studentCount={studentsByClassroom[s.classroom_id]?.length || 0}
                                    subjectAvatar={null}
                                    onClick={() => navigate(`/teacher/classrooms/${s.classroom_id}`, {
                                        state: { sessionId: s._id }
                                    })}
                                />
                            ))
                        } </div>
                )
            } </div>
    );
}

import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import API from "../../lib/axios";
import {toast} from "sonner";
import {Badge} from "../../components/ui/badge";

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
    attendanceStatus?: "none" | "checkin" | "checkout";
}

export default function TeacherClassroomAttendance() {
    const {id: classroomId} = useParams();
    const [students, setStudents] = useState < StudentType[] > ([]);
    const [currentClassroom, setCurrentClassroom] = useState < ClassroomType | null > (null);
    const [attendanceMap, setAttendanceMap] = useState < Record < string,
        "checkin" | "checkout" | null >> ({});
    // TODO: Replace with actual user context
    const teacherId = "CURRENT_TEACHER_ID";

    useEffect(() => {
        const fetchClassroomAndStudents = async () => {
            try {
                const classroomRes = await API.get(`/classrooms/${classroomId}`);
                const classroom = classroomRes.data;
                setCurrentClassroom(classroom);

                if (classroom ?. termId) {
                    const studentRes = await API.get(`/students/classroom/${classroomId}/term/${
                        classroom.termId
                    }`);
                    setStudents(Array.isArray(studentRes.data) ? studentRes.data : []);
                }
            } catch (err) {
                console.error("Error loading data", err);
                toast.error("បរាជ័យក្នុងការទាញយកទិន្នន័យ");
            }
        };

        if (classroomId) {
            fetchClassroomAndStudents();
        }
    }, [classroomId]);

    const handleAttendance = async (studentId : string, status : "checkin" | "checkout") => {
        try {
            await API.post("/attendance/check", {studentId, classroomId, teacherId, status});
            toast.success(status === "checkin" ? "ចូលរៀនដោយជោគជ័យ" : "ចេញរៀនដោយជោគជ័យ");
        } catch (err) {
            console.error(err);
            toast.error("បរាជ័យក្នុងការចុះបញ្ជីវត្តមាន");
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-lg font-bold mb-4">
                វត្តមាន - ថ្នាក់ {
                currentClassroom ?. name || "N/A"
            } </h1>

            <div className="space-y-3">
                {
                students && students.length > 0 ? (students.map((s) => (
                    <div key={
                            s._id
                        }
                        className="bg-white rounded-lg shadow p-3 flex items-center justify-between">
                        <Badge variant={
                            attendanceMap[s._id] === "checkin" ? "default" : attendanceMap[s._id] === "checkout" ? "destructive" : "secondary"
                        }>
                            {
                            attendanceMap[s._id] === "checkin" ? "បានចូលរៀន" : attendanceMap[s._id] === "checkout" ? "ចេញពីថ្នាក់" : "មិនទាន់ចូលរៀន"
                        } </Badge>
                        <div className="flex items-center gap-2">
                            <img src={
                                    s.profileUrl || "/default-avatar.png"
                                }
                                alt="student avatar"
                                className="w-10 h-10 rounded-full border object-cover"/>
                            <p className="font-medium">
                                {
                                s.name || "អនាមិក"
                            }</p>
                        </div>
                        <div className="flex gap-2">
                            {/* ✅ Check-in Button */}
                            <button className={
                                    `px-3 py-1 rounded font-medium ${
                                        s.attendanceStatus === "checkin" || s.attendanceStatus === "checkout" ? "bg-green-300 text-white cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"
                                    }`
                                }
                                disabled={
                                    s.attendanceStatus === "checkin" || s.attendanceStatus === "checkout"
                                }
                                onClick={
                                    () => handleAttendance(s._id, "checkin")
                            }>
                                ចូលរៀន
                            </button>

                            {/* ✅ Check-out Button */}
                            <button className={
                                    `px-3 py-1 rounded font-medium ${
                                        s.attendanceStatus === "checkout" ? "bg-red-300 text-white cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"
                                    }`
                                }
                                disabled={
                                    s.attendanceStatus === "checkout"
                                }
                                onClick={
                                    () => handleAttendance(s._id, "checkout")
                            }>
                                ចេញរៀន
                            </button>
                        </div>
                    </div>
                ))) : (
                    <p className="text-gray-500 text-sm">គ្មានសិស្សក្នុងថ្នាក់នេះ</p>
                )
            } </div>
        </div>
    );
}

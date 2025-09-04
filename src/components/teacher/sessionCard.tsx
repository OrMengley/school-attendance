import { Badge } from "../ui/badge"
import { KeenIcon } from "../../components/ui/keenicon";
import type { StudentType } from "../school/school-classroom-detail-modal";

interface SessionCardProps {
    subjectName: string;
    classroomName: string;
    startHour: string;
    startMin: string;
    endHour: string;
    endMin: string;
    sessionDay: string; // new
    students: StudentType[];
    studentCount: number;
    subjectAvatar?: string | null;
    onClick?: () => void;
}

export default function SessionCard({
    subjectName,
    classroomName,
    startHour,
    startMin,
    endHour,
    endMin,
    students,
    studentCount,
    subjectAvatar,
    sessionDay,
    onClick,
}: SessionCardProps) {
    const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

    // --- Time Progress Calculation ---
    const now = new Date();
    const start = new Date();
    start.setHours(Number(startHour), Number(startMin), 0, 0);
    const end = new Date();
    end.setHours(Number(endHour), Number(endMin), 0, 0);

    let progress = 0;
    if (sessionDay === todayName) {
        if (now < start) {
            progress = 0;
        } else if (now > end) {
            progress = 100;
        } else {
            const total = end.getTime() - start.getTime();
            const done = now.getTime() - start.getTime();
            progress = Math.min(100, Math.max(0, (done / total) * 100));
        }
    } else {
        progress = 0; // If session is not today, no progress
    }

    // Khmer status labels
    let statusLabel = "មុខវិជ្ជាបន្ទាប់";
    if (progress >= 100) {
        statusLabel = "បានបញ្ចប់";
    } else if (progress > 0 && progress < 100) {
        statusLabel = "កំពុងបង្រៀន";
    }

    return (
        <div
            onClick={onClick}
            className="relative flex items-center gap-4 rounded-xl bg-white shadow-md border p-4 overflow-hidden cursor-pointer hover:shadow-lg transition"
        >
            {/* Left Avatar (Subject Icon) */}
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-lg font-bold overflow-hidden">
                {subjectAvatar ? (
                    <img
                        src={subjectAvatar}
                        alt={subjectName}
                        className="w-full h-full object-cover"
                    />
                ) : (

                    <span>{subjectName?.charAt(0).toUpperCase()}</span>
                )}
            </div>

            {/* Right Content */}
            {/* Progress Bar */}
            <div className="flex-1">
                <div className="mt-2 flex items-center gap-2">
                    <div className="relative flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="absolute left-0 top-0 h-2 bg-green-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                        {Math.round(progress)}%
                    </span>
                    <Badge className={`${statusLabel === "បានបញ្ចប់" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"} $`}>
                        <div className="text-xs font-semibold">{statusLabel}</div>
                    </Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{subjectName}</h3>
               <div className="flex flex-row gap-2 justify-between">
               <div className="flex items-center gap-2 text-lg text-gray-600 mt-1">
                    <KeenIcon name="ki-duotone ki-delivery-door
" size="lg" className="text-blue-600" />
                    <span className=" text-gray-500">{classroomName}</span>
                </div>
                {/* Time */}
                <div className="flex items-center gap-2 text-lg text-gray-600 mt-1">
                    <KeenIcon name="ki-duotone ki-timer" size="lg" className="text-blue-600" />
                    <span>
                        {startHour}:{startMin} - {endHour}:{endMin}
                    </span>
                </div>
               </div>

                {/* Students Avatars */}
                <div className="flex items-center gap-1 mt-3">
                    {students.slice(0, 3).map((stu, i) => {
                        const avatar = stu?.profileUrl && stu.profileUrl.trim() !== ""
                            ? stu.profileUrl
                            : null;

                        return avatar ? (
                            <img
                                key={stu._id || i}
                                src={avatar}
                                alt={stu?.name || "Student"}
                                className={`w-7 h-7 rounded-full border-2 border-white shadow ${i > 0 ? "-ml-3" : ""
                                    }`}
                            />
                        ) : (
                            <div
                                key={stu._id || i}
                                className={`w-7 h-7 rounded-full border-2 border-white shadow bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700 ${i > 0 ? "-ml-3" : ""
                                    }`}
                            >
                                {stu?.name ? stu.name.charAt(0).toUpperCase() : "S"}
                            </div>
                        );
                    })}
                    {studentCount > 3 && (
                        <div className="-ml-3 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-medium flex items-center justify-center border-2 border-white">
                            +{studentCount - 3}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
// src/pages/teacher/reports/ReportStudentProfile.tsx
import { useEffect, useMemo, useState } from "react";
import API from "../../../lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import type {AttendanceType} from "../../../types/Attendance";
import type {StudentType} from "../../../types/Student";
import { fmtTime } from "../../../types/att";

interface ReportStudentProfileProps { student_id: string }

export default function ReportStudentProfile({ student_id }: ReportStudentProfileProps) {
  const [rows, setRows] = useState<AttendanceType[]>([]);
  const [student, setStudent] = useState<StudentType | null>(null);

  useEffect(()=>{ (async()=>{
    if (!student_id) return;
    const st = await API.get(`/students/${student_id}`);
    setStudent(st.data);
    console.log("student", student)
    const att = await API.get<AttendanceType[]>(`/attendance/student/${student_id}`);
    setRows(att.data||[]);
  })(); },[student_id]);

  const byDate = useMemo(()=>{
    const m = new Map<string, AttendanceType[]>();
    rows.forEach(r => m.set(r.date, [...(m.get(r.date)||[]), r]));
    return Array.from(m.entries()).sort((a,b)=> a[0]<b[0]?1:-1);
  }, [rows]);

  return (
    <div className="p-4 grid gap-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Student Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-3">
            {student?.profileUrl ? <img src={student.profileUrl} className="w-12 h-12 rounded-full" /> : <div className="w-12 h-12 rounded-full bg-gray-200" />}
            <div className="font-medium">{student?.name || "—"}</div>
          </div>

          <div className="grid gap-2">
            {byDate.map(([date, arr])=>(
              <Card key={date}>
                <CardHeader><CardTitle className="text-sm">{date}</CardTitle></CardHeader>
                <CardContent className="text-sm grid gap-1">
                  {arr.map(r=>(
                    <div key={r._id} className="flex justify-between">
                      <div>{r.status === "checkin" ? "ចូលរៀន" : "ចេញរៀន"}</div>
                      <div>{fmtTime(r.checkinTime || r.checkoutTime)}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
            {byDate.length===0 && <div className="text-sm text-muted-foreground">No records</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
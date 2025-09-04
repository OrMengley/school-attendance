// src/pages/teacher/reports/ReportStudentSummary.tsx
import { useEffect, useMemo, useState } from "react";
import API from "../../../lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Loader2 } from "lucide-react";
import type {AttendanceType} from "../../../types/Attendance";
import type {StudentType} from "../../../types/Student";
import { fmtTime } from "../../../types/att";
import { Link } from "react-router-dom";
import { Badge } from "../../../components/ui/badge";

export default function ReportStudentSummary() {
  const [students, setStudents] = useState<StudentType[]>([]);
  const [studentId, setStudentId] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [rows, setRows] = useState<AttendanceType[]>([]);
  const [loading, setLoading] = useState(false);

  const statusClass = (s: "checkin" | "checkout") =>
    s === "checkin" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-blue-100 text-blue-800 border-blue-200";

  useEffect(()=>{ (async()=>{
    const st = await API.get<StudentType[]>("/students");
    setStudents(st.data || []);
    if (st.data?.length) setStudentId(st.data[0]._id);
  })(); },[]);

  const load = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);
      const res = await API.get<AttendanceType[]>(`/attendance/student/${studentId}${params.toString()?`?${params.toString()}`:""}`);
      setRows(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const presentDays = useMemo(()=> new Set(rows.filter(r=>r.status==="checkin").map(r=>r.date)).size ,[rows]);
  const checkins = rows.filter(r=>r.status==="checkin").length;
  const checkouts = rows.filter(r=>r.status==="checkout").length;

  return (
    <div className="p-4 grid gap-3">
      <Card>
        <CardHeader><CardTitle className="text-base">Student Attendance Summary</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
              <SelectContent>
                {students.map(s=> <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
            <Input type="date" value={to} onChange={(e)=>setTo(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={load}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load"}</Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Present days</div><div className="text-xl font-semibold">{presentDays}</div></CardContent></Card>
            <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Check-ins</div><div className="text-xl font-semibold">{checkins}</div></CardContent></Card>
            <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Check-outs</div><div className="text-xl font-semibold">{checkouts}</div></CardContent></Card>
          </div>

          <div className="text-right">
            <Link to={`/teacher/reports/student-profile/${studentId}`} className="text-sm underline text-blue-600">Open Student Profile →</Link>
          </div>

          <div className="flex flex-wrap items-center gap-2 -mt-1">
            <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-200">ថ្ងៃវត្តមាន: {presentDays}</Badge>
            <Badge variant="outline" className="bg-emerald-100 text-emerald-900 border-emerald-200">ចូលរៀន: {checkins}</Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-900 border-blue-200">ចេញរៀន: {checkouts}</Badge>
          </div>

          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="p-2 text-left text-xs uppercase tracking-wide">Date</th>
                  <th className="p-2 text-left text-xs uppercase tracking-wide">Status</th>
                  <th className="p-2 text-left text-xs uppercase tracking-wide">Time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx)=>(
                  <tr key={r._id || `${r.date}-${r.status}-${idx}` } className="border-t odd:bg-muted/30">
                    <td className="p-2 font-medium">{r.date}</td>
                    <td className="p-2">
                      <Badge variant="outline" className={statusClass(r.status)}>
                        {r.status === "checkin" ? "ចូលរៀន" : "ចេញរៀន"}
                      </Badge>
                    </td>
                    <td className="p-2 font-mono text-slate-700">{fmtTime(r.checkinTime || r.checkoutTime)}</td>
                  </tr>
                ))}
                {rows.length === 0 && !loading && <tr><td colSpan={3} className="p-3 text-muted-foreground">No data</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
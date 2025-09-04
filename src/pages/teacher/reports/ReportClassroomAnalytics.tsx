// src/pages/teacher/reports/ReportClassroomAnalytics.tsx
import { useEffect, useMemo, useState } from "react";
import API from "../../../lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
// import type { Attendance, ClassroomType } from "@/types/Attendance";
import type {AttendanceType} from "../../../types/Attendance";
import type {ClassroomType} from "../../../types/Classroom";
import type {SessionType} from "../../../types/Session";

export default function ReportClassroomAnalytics() {
  const [classrooms, setClassrooms] = useState<ClassroomType[]>([]);
  const [classroom_id, setClassroom_id] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [rows, setRows] = useState<AttendanceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const normalizeArray = (value: unknown): AttendanceType[] => {
    if (Array.isArray(value)) return value as AttendanceType[];
    const maybeArray = (value as any)?.items || (value as any)?.data || [];
    return Array.isArray(maybeArray) ? (maybeArray as AttendanceType[]) : [];
  };

  useEffect(()=>{ (async()=>{
    try {
      setError(null);
      const cls = await API.get<ClassroomType[]>("/classrooms?role=teacher");
      setClassrooms(cls.data || []);
      if (!classroom_id && cls.data?.length) setClassroom_id(cls.data[0]._id);
    } catch (e: any) {
      console.error("Failed to load classrooms", e);
      const status = e?.response?.status;
      if (status === 401 || status === 403) setForbidden(true);
      setError(e?.response?.data?.message || e?.message || "Failed to load classrooms");
    }
  })(); },[]);

  useEffect(()=>{ (async()=>{
    if (!classroom_id) return;
    setLoading(true);
    try {
      setError(null);
      const qs = new URLSearchParams();
      if (from) qs.append("from", from);
      if (to) qs.append("to", to);
      const res = await API.get<AttendanceType[] | { data?: unknown; items?: unknown }>(`/attendance/by-classroom/${classroom_id}${qs.toString()?`?${qs}`:""}`);
      setRows(normalizeArray(res.data));
    } catch (e: any) {
      console.error("Failed to load attendance", e);
      const status = e?.response?.status;
      if (status === 401 || status === 403) setForbidden(true);
      setError(e?.response?.data?.message || e?.message || "Failed to load attendance");
      setRows([]);
    } finally { setLoading(false); }
  })(); }, [classroom_id, from, to]);

  const safeRows = Array.isArray(rows) ? rows : [];
  const presentCount = useMemo(()=> safeRows.filter(r=>r.status==="checkin").length, [safeRows]);
  const absentEstimate = 0; // if you track absences, fill this; else omit pie slice
  const pieData = [
    { name: "Check-ins", value: presentCount },
    { name: "Other", value: Math.max(0, safeRows.length - presentCount) },
  ];

  const perDay = useMemo(()=>{
    const map = new Map<string, number>();
    safeRows.forEach(r=>{
      if (r.status==="checkin") map.set(r.date, (map.get(r.date)||0) + 1);
    });
    return Array.from(map.entries()).map(([date, value])=>({ date, value }));
  }, [safeRows]);

  return (
    <div className="p-4 grid gap-3">
      <Card>
        <CardHeader><CardTitle className="text-base">Classroom Analytics</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          {forbidden && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              Access denied. You do not have permission to view this resource.
            </div>
          )}
          {error && !forbidden && (
            <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Select value={classroom_id} onValueChange={setClassroom_id}>
              <SelectTrigger><SelectValue placeholder="ជ្រើសរើសបន្ទប់" /></SelectTrigger>
              <SelectContent>
                {classrooms.map(c=> <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
            <Input type="date" value={to} onChange={(e)=>setTo(e.target.value)} />
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground"><Loader2 className="h-4 w-4 inline animate-spin" /> Loading…</div>
          ) : (
            <div className="grid gap-4">
              <div className="h-48 bg-white rounded-lg border p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={70} label>
                      {pieData.map((_, i)=><Cell key={i} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="h-48 bg-white rounded-lg border p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={perDay}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
// src/pages/teacher/reports/ReportTerm.tsx
import {useMemo, useState } from "react";
import API from "../../../lib/axios";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import type {AttendanceType} from "../../../types/Attendance";



export default function ReportTerm() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<AttendanceType[]>([]);

  const load = async () => {
    const qs = new URLSearchParams();
    if (from) qs.append("from", from);
    if (to) qs.append("to", to);
    const res = await API.get<AttendanceType[]>(`/attendance/range${qs.toString()?`?${qs}`:""}`);
    setRows(res.data || []);
  };

  const stats = useMemo(()=>{
    const checkins = rows.filter(r=>r.status==="checkin").length;
    const checkouts = rows.filter(r=>r.status==="checkout").length;
    return { checkins, checkouts, total: rows.length };
  }, [rows]);

  return (
    <div className="p-4 grid gap-3">
      <Card>
        <CardHeader><CardTitle className="text-base">Term / Monthly Report</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
            <Input type="date" value={to} onChange={(e)=>setTo(e.target.value)} />
            <Button onClick={load}>Load</Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Card><CardContent className="p-3"><div className="text-xs">Check-ins</div><div className="text-xl font-semibold">{stats.checkins}</div></CardContent></Card>
            <Card><CardContent className="p-3"><div className="text-xs">Check-outs</div><div className="text-xl font-semibold">{stats.checkouts}</div></CardContent></Card>
            <Card><CardContent className="p-3"><div className="text-xs">Total events</div><div className="text-xl font-semibold">{stats.total}</div></CardContent></Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>window.print()}>Print</Button>
            <Button onClick={()=>{/* export CSV/PDF */}}>Export</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
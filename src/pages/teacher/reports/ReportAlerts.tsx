// src/pages/teacher/reports/ReportAlerts.tsx
import { useEffect, useState } from "react";
import API from "../../../lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {Badge} from "../../../components/ui/badge"
import type {AttendanceType} from "../../../types/Attendance";

// Example alert rules (you can compute these on backend if you prefer)
export default function ReportAlerts() {
  const [rows, setRows] = useState<AttendanceType[]>([]);
  useEffect(()=>{ (async()=>{
    const today = new Date().toISOString().slice(0,10);
    const res = await API.get<AttendanceType[]>(`/attendance/today`); // make endpoint or reuse filters
    setRows(res.data || []);
  })(); },[]);

  const missingCheckout = rows.filter(r=> r.status==="checkin" && !r.checkoutTime);
  // Add more rules: repeated absences etc.

  return (
    <div className="p-4 grid gap-3">
      <Card>
        <CardHeader><CardTitle className="text-base">Alerts & Exceptions</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Missing checkout</Badge>
            <span className="text-sm text-muted-foreground">{missingCheckout.length} students</span>
          </div>
          <div className="grid gap-2">
            {missingCheckout.map(r=>(
              <div key={r._id} className="rounded-lg border p-3 text-sm">
                Student: {r.student_id} • Classroom: {r.classroom_id} • Check-in: {new Date(r.checkinTime!).toLocaleTimeString()}
              </div>
            ))}
            {missingCheckout.length===0 && <div className="text-sm text-muted-foreground">No alerts 🎉</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
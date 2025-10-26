// src/pages/teacher/reports/ReportDailyAttendance.tsx
import { useEffect, useState } from "react";
import API from "../../../lib/axios";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Loader2 } from "lucide-react";
import { fmtTime, khStatus } from "../../../types/att";
import { Badge } from "../../../components/ui/badge";
import { useUser } from "../../../context/UserContext";

import type {AttendanceType} from "../../../types/Attendance";
import type {ClassroomType} from "../../../types/Classroom";
import type {StudentType} from "../../../types/Student";
import type { DepartmentType } from "../../../types/Department";
import useFetchData from "../../../hooks/useFetchData";
import type { TermType } from "../../../types/Term";

export default function ReportDailyAttendance() {
  const { user } = useUser();
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().slice(0, 10);
  
  
  // Initialize date state with today's date
  const [date, setDate] = useState<string>(today);
  // const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const { data: departments } = useFetchData<DepartmentType>(`/departments/school/${user?.school_id}`);
  const [department_id, setDepartment_id] = useState<string>("");
  const { data: terms } = useFetchData<TermType>(`/terms/department/${department_id}`);
  const [classroom_id, setClassroom_id] = useState<string>("");
  const [term_id, setTerm_id] = useState<string>("");

  const [classrooms, setClassrooms] = useState<ClassroomType[]>([]);
  const [rows, setRows] = useState<AttendanceType[]>([]);
  const [students, setStudents] = useState<StudentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const normalizeArray = (value: unknown): AttendanceType[] => {
    if (Array.isArray(value)) return value as AttendanceType[];
    // handle common API envelope shapes
    const maybeArray = (value as any)?.items || (value as any)?.data || [];
    return Array.isArray(maybeArray) ? maybeArray as AttendanceType[] : [];
  };

  // Function to fetch attendance data
  const fetchAttendanceData = async (selectedDate: string, selectedClassroom_id: string) => {
    if (!selectedClassroom_id || !selectedDate) return;
    
    setLoading(true);
    try {
      setError(null);
      console.log(`Fetching attendance for classroom: ${selectedClassroom_id}, date: ${selectedDate}`);
      
      const res = await API.get<AttendanceType[] | { data?: unknown; items?: unknown }>(
        `/attendance/by-classroom/${selectedClassroom_id}?date=${selectedDate}`
      );
      
      const attendanceData = normalizeArray(res.data);
      console.log(`Received attendance data:`, attendanceData);
      
      setRows(attendanceData);
      
      if (attendanceData.length === 0) {
        setError(`No attendance data found for ${selectedDate}`);
      }
    } catch (e: any) {
      console.error("Failed to load attendance", e);
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        setForbidden(true);
      } else {
        setError(e?.response?.data?.message || e?.message || "Failed to load attendance");
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle date change
  const handleDateChange = (newDate: string) => {
    console.log(`Date changed to: ${newDate}`);
    setDate(newDate);
    setError(null); // Clear previous errors when date changes
  };

  // Handle classroom change
  const handleClassroomChange = (newClassroom_id: string) => {
    console.log(`Classroom changed to: ${newClassroom_id}`);
    setClassroom_id(newClassroom_id);
    setError(null); // Clear previous errors when classroom changes
  };
  const handleChangeDepartment = (newDepartment_id: string) => {
    console.log(`Department changed to: ${newDepartment_id}`);
    setDepartment_id(newDepartment_id);
    setError(null); // Clear previous errors when department changes
  };
  const handleChangeTerm = (newTerm_id: string) => {
    console.log(`Term changed to: ${newTerm_id}`);
    setTerm_id(newTerm_id);
    setError(null); // Clear previous errors when term changes
  };
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        // Load user from localStorage to restrict classrooms by classroomIds
        const raw = localStorage.getItem("user");
        let allowedIds: string[] = [];
        if (raw) {
          try {
            const u = JSON.parse(raw);
            if (Array.isArray(u?.classroomIds)) allowedIds = u.classroomIds as string[];
          } catch {}
        }
        const cls = await API.get<ClassroomType[]>(`/classrooms/school/${localStorage.getItem("school_id")}`);
        const all = Array.isArray(cls.data) ? cls.data : [];
        const filtered = allowedIds.length ? all.filter(c => allowedIds.includes(c._id)) : all;
        setClassrooms(filtered);
        
        // Set the first classroom as default if available
        if (filtered.length > 0) {
          const defaultClassroomId = filtered[0]._id;
          setClassroom_id(defaultClassroomId);
          console.log(`Default classroom set to: ${defaultClassroomId}`);
        }

        const allStudents = await API.get<StudentType[]>("/students"); // or your teacher-scoped endpoint
        setStudents(allStudents.data || []);
      } catch (e: any) {
        console.error("Failed to load initial data", e);
        const status = e?.response?.status;
        if (status === 401 || status === 403) setForbidden(true);
        setError(e?.response?.data?.message || e?.message || "Failed to load data");
      }
    })();
    // eslint-disable-next-line
  }, []);

  // Fetch attendance data whenever classroomId or date changes
  useEffect(() => {
    if (classroom_id && date) {
      console.log(`useEffect triggered - classroomId: ${classroom_id}, date: ${date}`);
      fetchAttendanceData(date, classroom_id);
    }
  }, [classroom_id, date]);

  const studentName = (id: string) => students.find(s => s._id === id)?.name || "—";
  const statusClass = (s: "checkin" | "checkout") =>
    s === "checkin" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-blue-100 text-blue-800 border-blue-200";

  return (
    <div className="p-4 grid gap-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily Attendance</CardTitle>
        </CardHeader>
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
          <div className="grid grid-cols-2 gap-2">
            
            <Select value={department_id} onValueChange={handleChangeDepartment}>
              <SelectTrigger><SelectValue placeholder="ជ្រើសរើស ឌីប៉ាត់ដឺម៉ង់" /></SelectTrigger>
              <SelectContent>
                {departments.map(department=> <SelectItem key={department._id} value={department._id}>{department.name}</SelectItem>)}
              </SelectContent>
            </Select>
            
            <Select value={term_id} onValueChange={handleChangeTerm}>
              <SelectTrigger><SelectValue placeholder="ជ្រើសរើស ឆ្នាំសិក្សា" /></SelectTrigger>
              <SelectContent>
                {terms.map(term=> <SelectItem key={term._id} value={term._id}>{term.year}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={classroom_id} onValueChange={handleClassroomChange}>
              <SelectTrigger><SelectValue placeholder="ជ្រើសរើសបន្ទប់" /></SelectTrigger>
              <SelectContent>
                {classrooms.map(c=> <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => handleDateChange(e.target.value)}
              max={today} // Don't allow future dates
            />
            
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/60">
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wide">Student</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Check-in</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Check-out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-sm text-muted-foreground"><Loader2 className="h-4 w-4 inline animate-spin" /> Loading…</TableCell></TableRow>
                ) : rows.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-sm text-muted-foreground">
                    {error ? error : `No attendance data found for ${date}`}
                  </TableCell></TableRow>
                ) : (
                  rows.map(r=>(
                    <TableRow key={r._id} className="odd:bg-muted/30">
                      <TableCell className="font-medium">{studentName(r.student_id)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusClass(r.status)}>
                          {khStatus(r.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className={r.checkinTime ? "text-emerald-700 font-mono" : "text-muted-foreground"}>{fmtTime(r.checkinTime)}</TableCell>
                      <TableCell className={r.checkoutTime ? "text-rose-700 font-mono" : "text-muted-foreground"}>{fmtTime(r.checkoutTime)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={()=>window.print()}>Print</Button>
            <Button onClick={()=>{/* export CSV here */}}>Export CSV</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
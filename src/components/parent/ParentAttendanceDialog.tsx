import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Loader2 } from "lucide-react";
import API from "../../lib/axios";
import type { ClassroomType } from "../../types/Classroom";
import type { StudentType } from "../../types/Student";

// raw attendance row (matches backend)
type AttendanceRaw = {
  _id: string;
  studentId: string;
  classroomId: string;
  sessionId?: string;
  date: string; // YYYY-MM-DD
  status: "checkin" | "checkout";
  checkinTime?: string;  // ISO
  checkoutTime?: string; // ISO
};

function fmtTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("km-KH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function khStatus(s: "checkin" | "checkout") {
  return s === "checkin" ? "ចូលរៀន" : "ចេញរៀន";
}
function badgeClass(s: "checkin" | "checkout") {
  return s === "checkin"
    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
    : "bg-sky-100 text-sky-700 border border-sky-200";
}

export default function ParentAttendanceDialog({
  open,
  onOpenChange,
  student,
  classrooms = [],
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student: StudentType | null;
  classrooms?: ClassroomType[];
}) {
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const [rows, setRows] = useState<AttendanceRaw[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const classroomName = (id?: string) =>
    classrooms.find((c) => c._id === id)?.name || "—";

  // fetch each time dialog opens or date range changes (and we have student)
  useEffect(() => {
    let active = true;
    async function run() {
      if (!open || !student?._id) return;
      try {
        setLoading(true);
        setErr(null);
        const qs = new URLSearchParams();
        if (range.from) qs.append("from", range.from);
        if (range.to) qs.append("to", range.to);
        const url = `/parents/me/children/${student._id}/attendance${qs.toString() ? `?${qs.toString()}` : ""}`;
        const res = await API.get<AttendanceRaw[]>(url);
        if (!active) return;
        setRows(res.data || []);
      } catch (e: any) {
        if (!active) return;
        setRows([]);
        setErr(e?.response?.data?.error || "មិនអាចទាញវត្តមានបានទេ");
      } finally {
        active && setLoading(false);
      }
    }
    run();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, student?._id, range.from, range.to]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const ta = new Date(a.checkoutTime || a.checkinTime || `${a.date}T00:00:00Z`).getTime();
      const tb = new Date(b.checkoutTime || b.checkinTime || `${b.date}T00:00:00Z`).getTime();
      return tb - ta;
    });
  }, [rows]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ប្រវត្តិវត្តមាន {student?.name ? `— ${student.name}` : ""}</DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">From</label>
            <Input
              type="date"
              value={range.from || ""}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">To</label>
            <Input
              type="date"
              value={range.to || ""}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-white">
        <div className="grid grid-cols-4 gap-2 px-4 py-3 text-sm font-medium text-gray-600">
            <div>កាលបរិច្ឆេទ</div>
            <div>ស្ថានភាព</div>
            <div>ម៉ោង</div>
            <div>បន្ទប់សិក្សា</div>
            
          </div>

          {loading ? (
            <div className="px-4 py-8 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> កំពុងផ្ទុក…
            </div>
          ) : err ? (
            <div className="px-4 py-8 text-sm text-red-600">{err}</div>
          ) : sorted.length === 0 ? (
            <div className="px-4 py-8 text-sm text-muted-foreground">មិនមានទិន្នន័យ</div>
          ) : (
            <div className="divide-y">
              {sorted.map((r) => {
                const timeToShow = r.status === "checkin" ? r.checkinTime : r.checkoutTime;
                return (
                    <div key={r._id} className="grid grid-cols-4 gap-2 px-4 py-3 text-sm">
                    <div className="text-gray-900">{r.date}</div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs ${badgeClass(r.status)}`}>
                        {khStatus(r.status)}
                      </span>
                    </div>
                    <div className="text-gray-800">{fmtTime(timeToShow)}</div>
                    <div className="text-gray-800">{classroomName(r.classroomId)}</div>
                    
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
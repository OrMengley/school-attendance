// src/layouts/parent/NotificationParent.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import { KeenIcon } from "../../components/ui/keenicon";
import API from "../../lib/axios";
import { cn } from "../../lib/utils"; // if you have a cn helper; otherwise remove usage
import { Loader2 } from "lucide-react";
import type  {StudentType}  from "../../types/Student";
import type  {AttendanceType}  from "../../types/Attendance";


type ChildrenResp =
  | StudentType[] // some backends return array
  | { children: StudentType[] }; // yours might return { children, subscriptionMap? }

function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function fmtTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("km-KH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function khStatus(s: "checkin" | "checkout") {
  return s === "checkin" ? "ចូលរៀន" : "ចេញរៀន";
}

export default function NotificationParent() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<
    Array<
      AttendanceType & {
        studentName: string;
        timeToShow: string;
      }
    >
  >([]);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  // fetch helper
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1) my children
      const childrenRes = await API.get<ChildrenResp>("/parents/me/children");
      const children: StudentType[] = Array.isArray(childrenRes.data)
        ? childrenRes.data
        : childrenRes.data.children || [];

      if (children.length === 0) {
        setItems([]);
        return;
      }

      // 2) today’s attendance per child
      const today = todayYMD();
      const qs = `?from=${today}&to=${today}`;

      const results = await Promise.allSettled(
        children.map((c) =>
          API.get<AttendanceType[]>(`/parents/me/children/${c._id}/attendance${qs}`).then((r) => ({
            student: c,
            rows: r.data || [],
          }))
        )
      );

      // 3) flatten, mark student names + time to show
      const flat: Array<AttendanceType & { studentName: string; timeToShow: string }> = [];
      results.forEach((res) => {
        if (res.status === "fulfilled") {
          const { student, rows } = res.value;
          rows.forEach((r) => {
            const timeToShow = r.status === "checkin" ? r.checkinTime : r.checkoutTime;
            flat.push({ ...r, studentName: student.name || "អនាមិក", timeToShow: fmtTime(timeToShow) });
          });
        }
      });

      // 4) newest first (by whichever time exists, fallback date)
      flat.sort((a, b) => {
        const ta = new Date(a.checkoutTime || a.checkinTime || `${a.date}T00:00:00Z`).getTime();
        const tb = new Date(b.checkoutTime || b.checkinTime || `${b.date}T00:00:00Z`).getTime();
        return tb - ta;
      });

      setItems(flat);
    } catch (e: any) {
      setItems([]);
      setError(e?.response?.data?.error || "មិនអាចទាញការជូនដំណឹងបានទេ");
    } finally {
      setLoading(false);
    }
  };

  // fetch when sheet opens, and poll every 30s while open
  useEffect(() => {
    if (open) {
      fetchNotifications();
      pollRef.current = window.setInterval(fetchNotifications, 30000);
    } else if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // unread count = all today's events (you can add read-state later)
  const count = useMemo(() => items.length, [items]);

  return (
    <div className="relative">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="relative rounded-sm p-1 bg-blue-50 hover:bg-blue-100 transition">
          <KeenIcon name="notification" className="text-blue-600 text-2xl" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] min-w-[18px] h-[18px] rounded-full bg-red-600 text-white px-1">
              {count}
            </span>
          )}
        </SheetTrigger>

        <SheetContent className="w-96 max-w-[90vw]">
          <SheetHeader>
            <SheetTitle>ការជូនដំណឹងវត្តមាន</SheetTitle>
            <SheetDescription>ព័ត៌មានវត្តមានថ្មីៗពីកូនៗរបស់អ្នក</SheetDescription>
          </SheetHeader>

          <div className="mt-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                កំពុងផ្ទុក…
              </div>
            ) : error ? (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-muted-foreground pl-4 text-center bg-blue-200">មិនមានការជូនដំណឹងសម្រាប់ថ្ងៃនេះ។</div>
            ) : (
              <ul className="space-y-3">
                {items.map((it) => (
                  <li
                    key={it._id}
                    className={cn(
                      "rounded-md border p-3 m-4",
                      it.status === "checkin" ? "border-emerald-200 bg-emerald-50/60" : "border-sky-200 bg-sky-50/60"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {it.studentName} • {khStatus(it.status)}
                      </div>
                      <div className="text-xs text-gray-500">{it.date}</div>
                    </div>
                    <div className="mt-1 text-sm text-gray-700">
                      ម៉ោង: <span className="font-medium">{it.timeToShow}</span>
                    </div>
                    {/* you can show classroom/subject if needed later */}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer actions */}
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              onClick={fetchNotifications}
              className="text-sm rounded-md border px-3 py-1.5 hover:bg-muted"
            >
              ធ្វើបច្ចុប្បន្នភាព
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
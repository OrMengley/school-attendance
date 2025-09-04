import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Loader2, User, Calendar, Clock } from "lucide-react";
import API from "../../lib/axios";
import { toast } from "sonner";
import type { StudentType } from "../../types/Student";
import type { ClassroomType } from "../../types/Classroom";
import useFetchData from "../../hooks/useFetchData";
import ParentAttendanceDialog from "../../components/parent/ParentAttendanceDialog";

type SubscriptionMap = Record<string, number>; // studentId -> UNIX seconds (start)
interface MeChildrenResponse {
  children: StudentType[];
  subscriptionMap?: SubscriptionMap;
}

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

function khSex(sex?: StudentType["sex"]) {
  if (sex === "male") return "ប្រុស";
  if (sex === "female") return "ស្រី";
  return "មិនមាន";
}
function khSubStatus(s: "active" | "expired") {
  return s === "active" ? "សកម្ម" : "ផុតកំណត់";
}
function computeSubscription(startUnix?: number) {
  if (!startUnix) return { subStatus: "expired" as const, daysLeft: 0, progressPct: 100 };
  const start = startUnix * 1000;
  const now = Date.now();
  const end = start + ONE_MONTH_MS;
  if (now >= end) return { subStatus: "expired" as const, daysLeft: 0, progressPct: 100 };
  const remainingMs = end - now;
  const daysLeft = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
  const elapsed = now - start;
  const progressPct = Math.min(100, Math.max(0, Math.round((elapsed / ONE_MONTH_MS) * 100)));
  return { subStatus: "active" as const, daysLeft, progressPct };
}

export default function ParentDashboard() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<StudentType[]>([]);
  const [subscriptionMap, setSubscriptionMap] = useState<SubscriptionMap>({});
  const [error, setError] = useState<string | null>(null);

  // dialog state
  const [attOpen, setAttOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<StudentType | null>(null);

  // classrooms for name lookup
  const { data: classrooms } = useFetchData<ClassroomType>("/classrooms");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await API.get<MeChildrenResponse | StudentType[]>("/parents/me/children");
        if (!mounted) return;
        if (Array.isArray(res.data)) {
          setChildren(res.data);
          setSubscriptionMap({});
        } else {
          setChildren(res.data.children || []);
          setSubscriptionMap(res.data.subscriptionMap || {});
        }
      } catch (e: any) {
        if (!mounted) return;
        setChildren([]);
        setSubscriptionMap({});
        setError(e?.response?.data?.error || "មិនអាចទាញទិន្នន័យបានទេ");
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const items = useMemo(() => {
    return (children || []).map((c) => {
      const meta = computeSubscription(subscriptionMap[c._id]);
      return { ...c, ...meta };
    });
  }, [children, subscriptionMap]);

  const classroomName = (classroomId?: string) =>
    classrooms.find((cl) => cl._id === classroomId)?.name || "—";

  const onOpenAttendance = (student: StudentType) => {
    setCurrentStudent(student);
    setAttOpen(true);
  };

  const onRequestRenewal = () => {
    toast.success("សំណើបានបញ្ជូន (UI only)");
  };

  return (
    <div className="p-4 max-w-3xl">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">ផ្ទាំងគ្រប់គ្រងមាតាបិតា</h1>
        <p className="text-sm text-muted-foreground">
          មើលការជាវវត្តមានរបស់កូនៗ (សុពលភាព ១ខែ) និងប្រវត្តិវត្តមាន។
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          កំពុងផ្ទុក…
        </div>
      )}

      {!loading && error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <Card className="mt-2">
          <CardContent className="p-6 text-sm text-muted-foreground">
            មិនមានកូនបានជាវនៅឡើយទេ។
          </CardContent>
        </Card>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid gap-3">
          {items.map((c: any) => (
            <Card key={c._id}>
              <CardHeader className="pb-3 flex-row justify-between items-start">
                <div className="flex items-center gap-3">
                  {c.profileUrl ? (
                    <img src={c.profileUrl} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-base">{c.name || "អនាមិក"}</CardTitle>
                    <div className="text-xs text-muted-foreground">
                      {khSex(c.sex)} • បន្ទប់: {classroomName(c.classroomId)} • ឆ្នាំសិក្សា: {c.term?.year || "—"}
                    </div>
                  </div>
                </div>

                <Badge
                  variant={c.subStatus === "active" ? "default" : "destructive"}
                  className="self-start"
                >
                  {khSubStatus(c.subStatus)}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>សុពលភាព ១ខែ</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {c.subStatus === "active" ? (
                      <span>នៅសល់ {c.daysLeft} ថ្ងៃ</span>
                    ) : (
                      <span>បានផុតកំណត់</span>
                    )}
                  </div>
                </div>

                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${c.subStatus === "active" ? "bg-blue-600" : "bg-gray-400"}`}
                    style={{ width: `${c.progressPct}%` }}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => onOpenAttendance(c)}>
                    មើលវត្តមាន
                  </Button>
                  <Button size="sm" onClick={onRequestRenewal}>
                    ស្នើជាវឡើងវិញ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Attendance dialog */}
      <ParentAttendanceDialog
        open={attOpen}
        onOpenChange={setAttOpen}
        student={currentStudent}
        classrooms={classrooms}
      />
    </div>
  );
}
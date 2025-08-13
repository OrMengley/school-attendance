import { useMemo, useState } from "react";
import useFetchData from "../../hooks/useFetchData";
import API from "../../lib/axios";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import ParentSubscribeModal from "../../components/school/parent_SubscribeModal";

type UserRole = "super_admin" | "admin" | "teacher" | "parent";

interface ParentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;              // "parent"
  schoolId?: string;
  subscribedStudents?: string[];
}

interface Student {
  _id: string;
  name: string;
  profileUrl?: string;
  parentPhone?: string;
  sex?: "male" | "female";
}

export default function SchoolParents() {
  // fetch only parents
  const { data: parents, loading: loadingParents, refetch: refetchParents } = useFetchData<ParentUser>("/users?role=parent");
  // fetch all students in this admin’s school (backend already filters by school via JWT)
  const { data: students, loading: loadingStudents } = useFetchData<Student>("/students");

  const [search, setSearch] = useState("");
  const [activeParent, setActiveParent] = useState<ParentUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const studentsById = useMemo(() => {
    const m = new Map<string, Student>();
    students.forEach(s => m.set(s._id, s));
    return m;
  }, [students]);

  const filteredParents = useMemo(() => {
    if (!search.trim()) return parents;
    const q = search.toLowerCase();
    return parents.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q))
    );
  }, [parents, search]);

  const openSubscribe = (p: ParentUser) => {
    setActiveParent(p);
    setModalOpen(true);
  };

  const handleSaveSubscriptions = async (parentId: string, studentIds: string[]) => {
    try {
      // Preferred endpoint (if you’ve added it):
      // await API.put(`/users/${parentId}/subscriptions`, { studentIds });

      // Fallback if you’re updating via general user update:
      await API.put(`/users/${parentId}/subscriptions`, { studentIds });

      toast.success("Subscriptions updated");
      setModalOpen(false);
      setActiveParent(null);
      refetchParents();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to update subscriptions");
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">👨‍👩‍👧 Parents</h1>
          <p className="text-sm text-muted-foreground">Subscribe students to each parent to enable attendance notifications.</p>
        </div>
        <div className="w-64">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search parents by name/email..."
          />
        </div>
      </div>

      {loadingParents ? (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">Loading parents…</div>
      ) : filteredParents.length === 0 ? (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">No parents found.</div>
      ) : (
        <div className="grid gap-3">
          {filteredParents.map((p) => {
            const subs = p.subscribedStudents || [];
            return (
              <div key={p.id} className="rounded-lg border bg-white p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.name || "Unnamed Parent"}</div>
                  <div className="text-sm text-muted-foreground truncate">{p.email}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {subs.length === 0 ? (
                      <Badge variant="secondary">No subscriptions</Badge>
                    ) : (
                      subs.slice(0, 4).map((sid) => {
                        const s = studentsById.get(sid);
                        return (
                          <Badge key={sid} variant="outline" className="max-w-[180px] truncate">
                            {s?.name ?? sid}
                          </Badge>
                        );
                      })
                    )}
                    {subs.length > 4 && (
                      <Badge className="bg-blue-600 text-white">+{subs.length - 4} more</Badge>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  <Button onClick={() => openSubscribe(p)}>Manage Subscriptions</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <ParentSubscribeModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setActiveParent(null); }}
        parent={activeParent}
        allStudents={students}
        loadingStudents={loadingStudents}
        onSave={handleSaveSubscriptions}
      />
    </div>
  );
}
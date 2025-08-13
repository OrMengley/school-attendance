import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { Badge } from "../../components/ui/badge";

interface ParentUser {
  id: string;
  name: string;
  email: string;
  subscribedStudents?: string[];
}

interface Student {
  _id: string;
  name: string;
  profileUrl?: string;
  parentPhone?: string;
  sex?: "male" | "female";
}

interface Props {
  open: boolean;
  onClose: () => void;
  parent: ParentUser | null;
  allStudents: Student[];
  loadingStudents?: boolean;
  onSave: (parentId: string, studentIds: string[]) => Promise<void> | void;
}

export default function ParentSubscribeModal({
  open,
  onClose,
  parent,
  allStudents,
  loadingStudents,
  onSave,
}: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (open && parent) {
      setSelected(parent.subscribedStudents || []);
      setSearch("");
    }
  }, [open, parent]);

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return allStudents;
    const q = search.toLowerCase();
    return allStudents.filter((s) => s.name?.toLowerCase().includes(q));
  }, [allStudents, search]);

  const toggle = (id: string, checked: boolean) => {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const selectedCount = selected.length;

  if (!parent) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Subscribe Students</DialogTitle>
          <DialogDescription>
            Parent: <span className="font-medium">{parent.name}</span> • {parent.email}
          </DialogDescription>
        </DialogHeader>

        <div className="px-1 pb-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name…"
          />
        </div>

        <div className="flex-1 overflow-y-auto border rounded-md p-3">
          {loadingStudents ? (
            <div className="text-sm text-muted-foreground">Loading students…</div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-sm text-muted-foreground">No students found.</div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map((s) => (
                <label key={s._id} className="flex items-center gap-3 border rounded-md p-2 hover:bg-muted/50">
                  <Checkbox
                    checked={selected.includes(s._id)}
                    onCheckedChange={(c) => toggle(s._id, Boolean(c))}
                  />
                  {s.profileUrl ? (
                    <img src={s.profileUrl} alt={s.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
                      {(s.name || "S").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-medium truncate">{s.name || "Unnamed Student"}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.sex ? <Badge variant="secondary" className="mr-2">{s.sex}</Badge> : null}
                      {s.parentPhone || "No phone"}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="mt-2">
          <div className="mr-auto text-sm text-muted-foreground">
            Selected: <span className="font-medium">{selectedCount}</span>
          </div>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(parent.id, selected)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
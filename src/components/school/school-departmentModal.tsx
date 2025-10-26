import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useUser } from "../../context/UserContext";
import type { DepartmentType } from "../../types/Department";





interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: { _id?: string; name: string;  school_id?: string }) => void;
  initialData?: DepartmentType | null;
}

export default function SchoolCreateDeparmentModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: DepartmentModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [school_id, setSchool_id] = useState(initialData?.school_id || "");
  const { user } = useUser();

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "");
      setSchool_id(initialData?.school_id || user?.school_id || "");
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const _id = initialData?._id || `department-${Date.now()}`;
    // const schoolId = user?.schoolId || initialData?.schoolId;
    onSubmit?.({ _id, name, school_id: school_id });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Department" : "Create Department"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Department name (e.g., Department 1)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <DialogDescription>
   
      </DialogDescription>
    </Dialog>
  );
}
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



interface SchoolType {
    _id: string;
    name: string;
    address: string;
    createdAt: string;
  }
interface DepartmentType {
    _id: string;
    name: string;
    schoolId: string;
    createdAt: string;
    school: SchoolType;
  }



interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: { _id?: string; name: string;  schoolId?: string }) => void;
  initialData?: DepartmentType | null;
}

export default function SchoolCreateDeparmentModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: DepartmentModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [schoolId, setSchoolId] = useState(initialData?.schoolId || "");
  const { user } = useUser();

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "");
      setSchoolId(initialData?.schoolId || user?.schoolId || "");
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const _id = initialData?._id || `department-${Date.now()}`;
    // const schoolId = user?.schoolId || initialData?.schoolId;
    onSubmit?.({ _id, name, schoolId });
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
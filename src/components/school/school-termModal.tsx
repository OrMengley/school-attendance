import { useEffect, useState } from "react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
  } from "../../components/ui/select";
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

import API from "../../lib/axios";


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
interface TermType {
    _id: string;
    year: string;
    departmentId: string;
    createdAt: string;
    department: DepartmentType;
  }


interface TermModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: { _id?: string; year: string;  departmentId?: string }) => void;
  initialData?: TermType | null;
}

export default function SchoolCreateTermModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: TermModalProps) {
  const [year, setYear] = useState(initialData?.year || "");
  const [departmentId, setDepartmentId] = useState<string | undefined>(initialData?.departmentId || "");
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  

  useEffect(() => {
    if (isOpen) {
      setYear(initialData?.year || "");
      setDepartmentId(initialData?.departmentId || "");
      API.get("/departments")
      .then((res) => setDepartments(res.data || []))
      .catch(() => setDepartments([]));
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const _id = initialData?._id || `term-${Date.now()}`;
    onSubmit?.({ _id, year: year, departmentId: departmentId || "" });
   
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Term" : "Create Term"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Term year (e.g., 2025)"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
          <Select value={departmentId} onValueChange={setDepartmentId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((department) => (
                <SelectItem key={department._id} value={department._id || ""}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
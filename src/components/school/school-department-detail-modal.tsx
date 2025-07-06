import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import { CalendarIcon, School2, Building2 } from "lucide-react";
import { Avatar } from "../ui/avatar";
import { format } from "date-fns";

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

interface DepartmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: DepartmentType | null;
}

export default function DepartmentDetailModal({
  isOpen,
  onClose,
  department,
}: DepartmentDetailModalProps) {
  if (!department) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Department Details</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Department Header */}
          <div className="flex items-center space-x-4">
            <Avatar className="items-center justify-center h-16 w-16 bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{department.name}</h2>
              <p className="text-sm text-muted-foreground">ID: {department._id}</p>
            </div>
          </div>

          <Separator />

          {/* School Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">School</h3>
            <div className="flex items-center space-x-3 rounded-md border p-3">
              <School2 className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{department.school.name}</p>
                <p className="text-xs text-muted-foreground">{department.school.address}</p>
              </div>
            </div>
          </div>

          {/* Creation Date */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
            <div className="flex items-center space-x-3 rounded-md border p-3">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <p className="text-sm">
                {format(new Date(department.createdAt), "PPP")}
              </p>
            </div>
          </div>

          {/* Additional Info - can be expanded with more department details */}
          <div className="rounded-md bg-muted/50 p-4">
            <h3 className="mb-2 font-medium">Department Information</h3>
            <p className="text-sm text-muted-foreground">
              This department belongs to {department.school.name} and was created on{" "}
              {format(new Date(department.createdAt), "MMMM d, yyyy")}.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
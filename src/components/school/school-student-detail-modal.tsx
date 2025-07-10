import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../ui/separator";
import { Calendar, MapPin, Phone, User, CalendarDays, Building, GraduationCap } from "lucide-react";


export interface Enrollment {
  termId: string;
  classroomId: string;
}

export type StudentStatus = "active" | "inactive";

interface StudentType {
  _id: string; // _id
  name: string;
  firstName?: string;
  lastName?: string;
  dob?: string; // Format: YYYY-MM-DD
  address?: string;
  profileUrl?: string;
  parentPhone: string;
  sex?: "male" | "female";
  status?: StudentStatus;
  classroomId?: string; // current classroomId
  termId?: string; // current termId
  createdAt?: string;
  enrollments: Enrollment[];
  classroom?: ClassroomType;
  term?: TermType;

}

interface ClassroomType {
    _id: string;
    name: string;
    gradeId: string;
    termId: string;
    createdAt: string;
    grade: {
        _id: string;
        name: string;
        termId: string;
        schoolId?: string;
        createdAt: string;
        term: {
            _id: string;
            year: string;
            departmentId: string;
            createdAt: string;
        };
    };
    term: {
        _id: string;
        year: string;
        departmentId: string;
        createdAt: string;
    };
}

interface TermType {
    _id: string;
    year: string;
    departmentId: string;
    createdAt: string;
}

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudent?: StudentType | null;
}

export default function StudentDetailModal({
  isOpen,
  onClose,
  selectedStudent,
}: StudentDetailModalProps) {
  const [student, setStudent] = useState<StudentType | null>(null);
  useEffect(() => {
    if (isOpen && selectedStudent) {
      setStudent(selectedStudent);
    }
  }, [isOpen, selectedStudent]);

 
  if (!student) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading student details...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!student) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-gray-600">Student not found</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Student Header */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={student.profileUrl} alt={student.name} />
              <AvatarFallback className="text-lg">
                {student.name}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{student.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={student.status === "active" ? "default" : "secondary"}>
                  {student.status}
                </Badge>
                {/* <span className="text-sm text-gray-500">ID: {student._id}</span> */}
              </div>
            </div>
          </div>

          <Separator />

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">First Name</label>
                <p className="text-sm">{student.firstName || "Not specified"}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Last Name</label>
                <p className="text-sm">{student.lastName || "Not specified"}</p>
              </div>
              

              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  Date of Birth
                </label>
                <p className="text-sm">{student.dob ? format(new Date(student.dob), "PPP") : "Not specified"}</p>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Address
                </label>
                <p className="text-sm">{student.address || "Not specified"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Contact Information
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Parent Phone</label>
              <p className="text-sm">{student.parentPhone}</p>
            </div>
          </div>

          <Separator />

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <GraduationCap className="h-5 w-5 mr-2" />
              Academic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  Classroom
                </label>
                <p className="text-sm">
                  {student.classroom?.name || "Not assigned"}
                </p>
                {student.classroom?.grade?.name && (
                  <p className="text-xs text-gray-500">Grade: {student.classroom.grade.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Academic Term
                </label>
                <p className="text-sm">
                  {student.term?.year || "Not assigned"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* System Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">System Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Enrollment Date</label>
                <p className="text-sm">
                  {student.enrollments && student.enrollments.length > 0 
                    ? `${student.enrollments.length} enrollment(s)` 
                    : "No enrollments"}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-sm">{student.createdAt ? format(new Date(student.createdAt), "PPP") : "Not specified"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>   
      </DialogContent>
      <DialogDescription>
        
      </DialogDescription>
    </Dialog>
  );
} 
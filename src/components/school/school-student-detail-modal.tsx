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


interface TermType {
  _id: string;
  year: string;
  departmentId: string;
  createdAt: string;
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

  console.log("student", selectedStudent);
  
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl border-0">
        <DialogTitle>Student Details</DialogTitle>
        <DialogHeader>
          <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
            <Avatar className="h-28 w-28 ring-2 ring-blue-100 shadow">
              <AvatarImage className="object-cover" src={student.profileUrl} alt={student.name} />
              <AvatarFallback className="text-xl bg-gray-100 text-gray-700">
                {student.name}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={
                  student.status === "active"
                    ? "bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                    : "bg-gray-200 text-gray-500 px-3 py-1 rounded-full"
                }>
                  {student.status}
                </Badge>
              </div>
            </div>
            <Button variant="outline" onClick={onClose} className="ml-auto border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition rounded-full">
              Close
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-8 py-6 px-2 md:px-6">
          {/* Personal Information */}
          <div className="rounded-lg p-0">
            <h3 className="text-lg font-semibold flex items-center text-blue-700 mb-4">
              <User className="h-5 w-5 mr-2 text-blue-400" />
              ពត៍មានសិស្ស
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">ត្រកូល (First Name)</label>
                <p className="text-base text-gray-800">{student.firstName || "Not specified"}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">ឈ្មោះ (Last Name)</label>
                <p className="text-base text-gray-800">{student.lastName || "Not specified"}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <CalendarDays className="h-4 w-4 mr-1 text-blue-300" />
                   ថ្ងៃខែឆ្នាំកំណើត (Date of Birth)
                </label>
                <p className="text-base text-gray-800">{student.dob ? format(new Date(student.dob), "PPP") : "Not specified"}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <CalendarDays className="h-4 w-4 mr-1 text-blue-300" />
                   ភេទ (Gender)
                </label>
                <p className="text-base text-gray-800">
                  {student.sex ? (student.sex === "female" ? "ស្រី" : student.sex === "male" ? "ប្រុស" : student.sex) : "Not specified"}
                </p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-blue-300" />
                   អាសយដ្ឋាន (Address)
                </label>
                <p className="text-base text-gray-800">{student.address || "Not specified"}</p>
              </div>
            </div>
          </div>
          <Separator />
          {/* Contact Information */}
          <div className="rounded-lg p-0">
            <h3 className="text-lg font-semibold flex items-center text-blue-700 mb-4">
              <Phone className="h-5 w-5 mr-2 text-blue-400" />
              ព៍ត៍មានអាណាព្យាបាល
            </h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500"> លេខទូរស័ព្ទអាណាព្យាបាល (Parent Phone)</label>
              <p className="text-base text-gray-800">{student.parentPhone}</p>
            </div>
          </div>
          <Separator />
          {/* Academic Information */}
          <div className="rounded-lg p-0">
            <h3 className="text-lg font-semibold flex items-center text-blue-700 mb-4">
              <GraduationCap className="h-5 w-5 mr-2 text-blue-400" />
              ពត៍មានសិក្សា
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Building className="h-4 w-4 mr-1 text-blue-300" />
                   បន្ទប់សិក្សា (Classroom)
                </label>
                <p className="text-base text-gray-800">
                  {student.classroom?.name || "Not assigned"}
                </p>
                {student.classroom?.grade?.name && (
                  <p className="text-xs text-blue-600">Grade: <span className="font-bold">{student.classroom.grade.name}</span></p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-blue-300" />
                   ឆ្នាំសិក្សា (Academic Term)
                </label>
                <p className="text-base text-gray-800">
                  {student.term?.year || "Not assigned"}
                </p>
              </div>
            </div>
          </div>
          <Separator />
          {/* System Information */}
          <div className="rounded-lg p-0">
            <h3 className="text-lg font-semibold flex items-center text-blue-700 mb-4">
              <Calendar className="h-5 w-5 mr-2 text-blue-400" />
              ពត៍មានប្រព័ន្ធ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">ធ្លាប់សិក្សា</label>
                <p className="text-base text-gray-800">
                  {student.enrollments && student.enrollments.length > 0 
                    ? `${student.enrollments.length} enrollment(s)` 
                    : "No enrollments"}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-base text-gray-800">{student.createdAt ? format(new Date(student.createdAt), "PPP") : "Not specified"}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogDescription></DialogDescription>
    </Dialog>
  );
} 
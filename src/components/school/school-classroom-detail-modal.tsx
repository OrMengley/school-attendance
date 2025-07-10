import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { Calendar, GraduationCap, School, Clock, Hash } from "lucide-react";

interface TermType {
  _id: string;
  year: string;
  departmentId: string;
  createdAt: string;
}

interface GradeType {
  _id: string;
  name: string;
  termId: string;
  schoolId?: string;
  createdAt: string;
  term: TermType;
}

interface ClassroomType {
  _id: string;
  name: string;
  gradeId: string;
  termId: string;
  createdAt: string;
  grade: GradeType;
  term: TermType;
}

interface ClassroomDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: ClassroomType | null;
}

export default function SchoolClassroomDetailModal({
  isOpen,
  onClose,
  classroom,
}: ClassroomDetailModalProps) {
  if (!classroom) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Classroom Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Classroom Name */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Hash className="h-4 w-4 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">បន្ទប់សិក្សា</p>
              <p className="text-lg font-semibold">{classroom.name}</p>
            </div>
          </div>

          <Separator />

          {/* Grade Information */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-600">កម្រិតសិក្សា</p>
              <p className="text-lg font-semibold">{classroom.grade?.name || 'No Grade'}</p>
            </div>
          </div>

          <Separator />

          {/* Term Information */}
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <Calendar className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-600">ឆ្នាំសិក្សា</p>
              <p className="text-lg font-semibold">{classroom.term?.year || 'No Term'}</p>
            </div>
          </div>

          <Separator />

          {/* Creation Date */}
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <Clock className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-600">បង្កើតនៅ</p>
              <p className="text-sm">{formatDate(classroom.createdAt)}</p>
            </div>
          </div>

          <Separator />
        </div>
        <DialogDescription>
          
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>

      </DialogContent>
      
    </Dialog>
  );
} 
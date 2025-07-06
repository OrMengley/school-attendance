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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import API from "../../lib/axios";
import { toast } from "sonner";




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



interface ClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ClassroomType | null;
  onSuccess?: () => void;
}

export default function SchoolCreateClassroomModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: ClassroomModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [gradeId, setGradeId] = useState(initialData?.gradeId || "");
  const [termId, setTermId] = useState(initialData?.grade?.termId || "");

  const [grades, setGrades] = useState<GradeType[]>([]);
  const [terms, setTerms] = useState<TermType[]>([]);
  const { user } = useUser();
  
  const gradesLoading = grades.length === 0;
  const termsLoading = terms.length === 0;
  
  useEffect(() => {
    if (isOpen) {
        API.get("/terms")
        .then((res) => setTerms(res.data || []))
        .catch(() => setTerms([]));

        API.get("/grades")
        .then((res) => setGrades(res.data || []))
        .catch(() => setGrades([]));
        
      setName(initialData?.name || "");
      setGradeId(initialData?.gradeId || "");
      setTermId(initialData?.grade?.termId || "");
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault();
    
    const data = {
      name,
      gradeId,
      termId,
      schoolId: user?.schoolId,
    }
    
    try {
      if (initialData) {
        // Update existing classroom
        await API.put(`/classrooms/${initialData._id}`, data);
        toast.success("Classroom updated successfully");
      } else {
        // Create new classroom
        await API.post("/classrooms", data);
        toast.success("Classroom created successfully");
      }
      
      // Close modal and refresh data
      onClose();
      onSuccess?.();
      
      // Reset form
      setName("");
      setGradeId("");
      setTermId("");
      
    } catch (error) {
      console.error("Error saving classroom:", error);
      toast.error("Failed to save classroom");
    }
  };

  if (gradesLoading || termsLoading) return <p>Loading...</p>;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "✍️ កែប្រែថ្នាក់សិក្សា" : "📦 បង្កើតថ្នាក់សិក្សា"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
        <div className=" grid grid-cols-2 gap-4 w-auto">
            
        <Select value={termId} onValueChange={setTermId} required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="ជ្រើសរើសឆ្នាំសិក្សា" />
            </SelectTrigger>
            <SelectContent>
              {terms.map((term) => (
                <SelectItem key={term._id} value={term._id || ""}>
                  {term.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={gradeId} onValueChange={setGradeId} required>
          <SelectTrigger className="w-full">
              <SelectValue placeholder="ជ្រើសរើសកម្រិតថ្នាក់" />
            </SelectTrigger>
            <SelectContent>
              {grades
                .filter(grade => grade.termId === termId)
                .map((grade) => (
                  <SelectItem key={grade._id} value={grade._id || ""}>
                    {grade.name}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>

          </div>
          <div className="">
            <Input
            placeholder="Classroom name (e.g., Classroom 1)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          </div>
        
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
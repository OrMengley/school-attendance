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
import { Label } from "../../components/ui/label";
import { useUser } from "../../context/UserContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { ClassroomType } from "../../types/Classroom";
import type { UserType } from "../../types/User";
import API from "../../lib/axios";
import { toast } from "sonner";

import type {
  TermType

} from "../../types/Term";
import type { GradeType } from "../../types/Grade";
import type { DepartmentType } from "../../types/Department";
// import useFetchData from "../../hooks/useFetchData";



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
  const [grade_id, setGrade_id] = useState(initialData?.grade_id || "");
  const [term_id, setTerm_id] = useState(initialData?.grade?.term_id || "");
  const [department_id, setDepartment_id] = useState<string>("");

  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [grades, setGrades] = useState<GradeType[]>([]);
  const [terms, setTerms] = useState<TermType[]>([]);
  const [teachers, setTeachers] = useState<UserType[]>([]);
  const [teacher_id, setTeacher_id] = useState<string>("");
  const [status, setStatus] = useState<"available" | "unavailable">("available");
  const { user } = useUser();

  // const { data: departments,  } = useFetchData<DepartmentType>("/departments");
  // const { data: terms} = useFetchData<TermType>(`/terms/department/${department_id}`);
  // const { data: grades} = useFetchData<GradeType>(`grades/term/${term_id}`);

  useEffect(() => {
    
   
    // API.get(`grades/term/${term_id}`).then((res) => setDepartments(res.data || []));
      // getGradesByTerm(term_id).then((grades) => {
      //     if(grades){
      //       setGrades(grades);
      //     }
      //   });
    if (isOpen) {
      API.get("/users?role=teacher&schoolId=" + user?.school_id)
        .then((res) => setTeachers(res.data || []))
        .catch(() => setTeachers([]));
      setName(initialData?.name || "");
      // setGrade_id(initialData?.grade_id || "");
      // setTerm_id(initialData?.grade?.term_id || "");
    }

    API.get("/departments")
      .then((res) => setDepartments(res.data || []));
    if(department_id){
      API.get(`/terms/department/${department_id}`)
      .then((res) => setTerms(res.data || []));
    }
    if(term_id){
      API.get(`/grades/term/${term_id}`)
      .then((res) => setGrades(res.data || []));
    }
    // API.get(`/terms/department/${department_id}`)
    //   .then((res) => setTerms(res.data || []));

    // getTermsByDeparment(department_id);
    // if(term_id){
    //   API.get(`/grades/term/${term_id}`)
    //   .then((res) => setGrades(res.data || []));
    // }

  }, [isOpen, department_id, term_id]);
  // useEffect(() => {
  //   if (term_id) {
  //     getGradesByTerm(term_id).then((grades) => {
  //       setGrades(grades);
  //     });
  //   }
  // }, []);

  const getTermsByDeparment = async (department_id: string) => {
    try {
      const res = await API.get(`/terms/department/${department_id}`);
      return res.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };


  const getGradesByTerm = async (term_id: string) => {
    try {
      const res = await API.get(`grades/term/${term_id}`);
      return res.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name,
      grade_id: grade_id,
      term_id: term_id,
      school_id: user?.school_id,
      department_id: department_id,
      status: status,
      teacherIds: [],
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
      setGrade_id("");
      setTerm_id("");

    } catch (error) {
      console.error("Error saving classroom:", error);
      toast.error("Failed to save classroom");
    }
  };

  
  
  console.log("terms", terms)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "✍️ កែប្រែថ្នាក់សិក្សា" : "📦 បង្កើតថ្នាក់សិក្សា"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 w-auto">
            <div className="space-y-2">
              <Label htmlFor="department">Department (ដេបាត់ម៉ង់)</Label>
              <Select value={department_id} onValueChange={setDepartment_id} required>
                <SelectTrigger className="w-full" id="department">
                  <SelectValue placeholder="ជ្រើសរើស ដេបាត់ម៉ង់" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department._id} value={department._id || ""}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="term">Academic Year (ឆ្នាំសិក្សា)</Label>
              <Select value={term_id} onValueChange={setTerm_id} required>
                <SelectTrigger className="w-full" id="term">
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
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="grade">Grade Level (កម្រិតថ្នាក់)</Label>
              <Select value={grade_id} onValueChange={setGrade_id} required>
                <SelectTrigger className="w-full" id="grade">
                  <SelectValue placeholder="ជ្រើសរើសកម្រិតថ្នាក់" />
                </SelectTrigger>
                <SelectContent>
                 
                  {grades.map((grade) => (
                    <SelectItem key={grade._id} value={grade._id || ""}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2 col-span-2">
              <Label htmlFor="grade">Status (ស្ថានភាព)</Label>
              <Select value={status} onValueChange={(e) => setStatus(e as "available" | "unavailable")} required>
                <SelectTrigger className="w-full" id="grade">
                  <SelectValue placeholder="ជ្រើសរើសកម្រិតថ្នាក់" />
                </SelectTrigger>
                <SelectContent>
                
                  <SelectItem key="available" value="available">
                    Available (ដំណើរការប្រើប្រាស់)
                  </SelectItem>
                  <SelectItem key="unavailable" value="unavailable">
                    Unavailable (បិទដំណើរការប្រើ)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          <div>
            
          </div>
          <div className="space-y-2">
            <Label htmlFor="classroom-name">Classroom Name (ឈ្មោះថ្នាក់)</Label>
            <Input
              id="classroom-name"
              placeholder="Classroom name (e.g., Classroom 1)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher">Assigned Teacher (គ្រូបង្រៀន)</Label>
            <Select value={teacher_id} onValueChange={setTeacher_id} required>
              <SelectTrigger className="w-full" id="teacher">
                <SelectValue placeholder="ជ្រើសរើសគ្រូបង្រៀន" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher._id} value={teacher._id || ""}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
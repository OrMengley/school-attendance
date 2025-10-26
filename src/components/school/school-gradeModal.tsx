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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import API from "../../lib/axios";
import { useUser } from "../../context/UserContext";
import type { GradeType } from "../../types/Grade";
import type { TermType } from "../../types/Term";
import type { DepartmentType } from "../../types/Department";
import useFetchData from "../../hooks/useFetchData";



interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: { _id?: string; name: string; term_id: string; school_id?: string, department_id?:string }) => void;
  initialData?: GradeType | null;
}

export default function SchoolCreateGradeModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: GradeModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [term_id, setTerm_id] = useState<string | undefined>(initialData?.term_id || "");
  const [department_id, setDepartment_id] = useState<string | undefined>("");
  // const  [department, setDepartment] = useState<DepartmentType | null>(null);
  const [terms, setTerms] = useState<TermType[]>([]);
  const { user } = useUser();
  const { data: departmentData} = useFetchData<DepartmentType>("/departments");


  const getTermsByDeparment = async (department_id: string) => {
    try {
      const res = await API.get(`/terms/department/${department_id}`);
      return res.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };


  useEffect(() => {
    if (department_id) {
      getTermsByDeparment(department_id).then((terms) => {
        setTerms(terms);
      });
    }
  }, [department_id]);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "");
      setTerm_id(initialData?.term_id || "");

    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const _id = initialData?._id || `grade-${Date.now()}`;
    const school_id = user?.school_id || initialData?.school_id;
    
    onSubmit?.({ _id, name,department_id, term_id: term_id || "", school_id: school_id });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Grade" : "Create Grade"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Grade name (e.g., Grade 1)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Select value={department_id} onValueChange={setDepartment_id} required>
            <SelectTrigger>
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              {departmentData.map((department) => (
                <SelectItem key={department._id} value={department._id || ""}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={term_id} onValueChange={setTerm_id} required disabled={!department_id}>
            <SelectTrigger>
              <SelectValue placeholder="Select Term" />
            </SelectTrigger>
            <SelectContent>
              {terms.map((term) => (
                <SelectItem key={term._id} value={term._id || ""}>
                  {term.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" >
              {initialData ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <DialogDescription>
        
            {initialData ? "Edit Grade" : "Create Grade"}
        
      </DialogDescription>
    </Dialog>
  );
}
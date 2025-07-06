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


interface TermType {
    _id?: string;
    year: string;
}
interface GradeType {
    _id: string;
    name: string;
    termId: string;
    schoolId?: string;
    createdAt: string;
    term: TermType;
}



interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: { _id?: string; name: string; termId: string; schoolId?: string }) => void;
  initialData?: GradeType | null;
}

export default function SchoolCreateGradeModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: GradeModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [termId, setTermId] = useState<string | undefined>(initialData?.termId || "");
  const [terms, setTerms] = useState<TermType[]>([]);
  const { user } = useUser();

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "");
      setTermId(initialData?.termId || "");
      API.get("/terms")
        .then((res) => setTerms(res.data || []))
        .catch(() => setTerms([]));
        
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const _id = initialData?._id || `grade-${Date.now()}`;
    const schoolId = user?.schoolId || initialData?.schoolId;
    onSubmit?.({ _id, name, termId: termId || "", schoolId });
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

          <Select value={termId} onValueChange={setTermId} required>
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
        <p>
            {initialData ? "Edit Grade" : "Create Grade"}
        </p>
      </DialogDescription>
    </Dialog>
  );
}
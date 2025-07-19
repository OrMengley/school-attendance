import DataTable from "../../components/school/data-table";
import useFetchData from "../../hooks/useFetchData";
import SchoolCreateClassroomModal from "../../components/school/school-classroomModal";
import SchoolClassroomDetailModal from "../../components/school/school-classroom-detail-modal";
import { useState, useMemo } from "react";

import { Button } from "../../components/ui/button";
import { Edit, Eye, Plus } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

interface SessionType {
  _id: string;
  subjecName: string;
  teacherId: string;
  sessionHourStart:string;
  sessionMinStart:string;
  sessionHourEnd:string;
  sessionMinEnd:string;
}
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
  studentIds:string[];
  term: TermType;
  sessions: SessionType[];
}


export default function SchoolClassroom() {

  const { data: classrooms, loading, refetch } = useFetchData<ClassroomType>("/classrooms");
  const { data: terms, loading: termsLoading, } = useFetchData<TermType>("/terms");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<ClassroomType | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<string>("");
  
  // Filter classrooms based on selected term
  const filteredClassrooms = useMemo(() => {
    if (!classrooms) return [];
    if (!selectedTermId || selectedTermId === "all") return classrooms;
    return classrooms.filter(classroom => classroom.termId === selectedTermId);
  }, [classrooms, selectedTermId]);
  
  const handleOpenEdit = (classroom: ClassroomType) => {
    setSelectedClassroom(classroom);
    setIsModalOpen(true);
  }

  const handleOpenDetail = (classroom: ClassroomType) => {
    setSelectedClassroom(classroom);
    setIsDetailModalOpen(true);
  }

  if (loading) return <p>Loading classrooms...</p>;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Classroom Management</h1>
        <div className="flex items-center gap-2">
          <Select value={selectedTermId} onValueChange={setSelectedTermId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by term" />
            </SelectTrigger>
            <SelectContent>
              {termsLoading ? (
                <SelectItem value="loading">Loading terms...</SelectItem>
              ) : terms && terms.length > 0 ? (
                <>
                  <SelectItem value="all">All Terms</SelectItem>
                  {terms.map((term) => (
                    <SelectItem key={term._id} value={term._id}>
                      {term.year}
                    </SelectItem>
                  ))}
                </>
              ) : (
                <SelectItem value="none">No terms available</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsModalOpen(true)} className="ml-2">
            <Plus className="h-4 w-4 mr-2" />
            Add Classroom
          </Button>
        </div>
      </div>
     
      <DataTable
        key={`${filteredClassrooms?.length}-${selectedTermId}`}
        data={filteredClassrooms?.map((classroom) => {
          return ({
            ...classroom,
            gradeName: classroom.grade?.name || 'No Grade',
            termName: classroom.term?.year || 'No Term',
            key: classroom._id,
          });
        }) || []}
        title={`🏫 បន្ទប់សិក្សា${selectedTermId && selectedTermId !== "all" ? ` - ${terms?.find(t => t._id === selectedTermId)?.year || ''}` : ''}`}
        columns={[
          { label: "ឈ្មោះបន្ទប់សិក្សា", key: "name" },
          { label: "ឆ្នាំសិក្សា", key: "termName" },
          { label: "កម្រិតសិក្សា", key: "gradeName" },
          { label: "បង្កើតនៅ", key: "createdAt" },
        ]}

        actions={
          (classroom) => (
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => handleOpenDetail(classroom)}>
                <Eye className="h-4 w-4 mr-1" /> View
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleOpenEdit(classroom)}>
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          )
        }
      />
      
      <SchoolCreateClassroomModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClassroom(null);
        }}
        initialData={selectedClassroom}
        onSuccess={refetch}
      />
      
      <SchoolClassroomDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedClassroom(null);
        }}
        classroom={selectedClassroom || null}
      />
    </div>
  );
}
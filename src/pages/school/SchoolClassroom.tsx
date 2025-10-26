import DataTable from "../../components/school/data-table";
import useFetchData from "../../hooks/useFetchData";
import SchoolCreateClassroomModal from "../../components/school/school-classroomModal";
import SchoolClassroomDetailModal from "../../components/school/school-classroom-detail-modal";
import { useState, useMemo, useEffect } from "react";

import { Button } from "../../components/ui/button";
import { Edit, Eye, Plus } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import type { ClassroomType } from "../../types/Classroom";
import type { TermType } from "../../types/Term";
import API from "../../lib/axios";
import { useUser } from "../../context/UserContext";
// interface SessionType {
//   _id: string;
//   subjectName: string;
//   teacherId: string;
//   sessionStartHour:string;
//   sessionStartMin:string;
//   sessionEndHour:string;
//   sessionEndMin:string;
// }
// interface TermType {
//   _id: string;
//   year: string;
//   departmentId: string;
//   createdAt: string;
// }
// interface GradeType {
//   _id: string;
//   name: string;
//   termId: string;
//   schoolId?: string;
//   createdAt: string;
//   term: TermType;
// }
// interface ClassroomType {
//   _id: string;
//   name: string;
//   gradeId: string;
//   termId: string;
//   createdAt: string;
//   grade: GradeType;
//   studentIds:string[];
//   term: TermType;
//   sessions: SessionType[];
// }


export default function SchoolClassroom() {
  const { user } = useUser();
  const { data: classrooms, loading, refetch } = useFetchData<ClassroomType>(`/classrooms/school/${user?.school_id}`);
  // const { data: terms, loading: termsLoading, } = useFetchData<TermType>("/terms");
  const [terms , setTerms] = useState < TermType[] > ([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<ClassroomType | null>(null);
  const [selectedTerm_id, setSelectedTermId] = useState<string>("");
  
  useEffect(() => {
    const fetchTerms = async () => {
            try {
                const res = await API.get(`/terms?school_id=${user?.school_id}`);
                console.log("Terms data:", res.data);
                if (res.data && Array.isArray(res.data)) {
                    setTerms(res.data);
                }
            } catch (error) {
                console.error("Error fetching terms:", error);
                setTerms([]);
            }
        };
        if (user?.school_id) {
            fetchTerms();
            // fetchDepartments();
        }
  }, [selectedTerm_id]);
  // Filter classrooms based on selected term
  const filteredClassrooms = useMemo(() => {
    if (!classrooms) return [];
    if (!selectedTerm_id || selectedTerm_id === "all") return classrooms;
    return classrooms.filter(classroom => classroom.term_id === selectedTerm_id);
  }, [classrooms, selectedTerm_id]);
  
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
          <Select value={selectedTerm_id} onValueChange={setSelectedTermId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by term" />
            </SelectTrigger>
            <SelectContent>
              {terms.length === 0 ? (
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
        key={`${filteredClassrooms?.length}-${selectedTerm_id}`}
        data={filteredClassrooms?.map((classroom) => {
          return ({
            ...classroom,
            gradeName: classroom.grade?.name || 'No Grade',
            termName: classroom.term?.year || 'No Term',
            key: classroom._id,
          });
        }) || []}
        title={`🏫 បន្ទប់សិក្សា${selectedTerm_id && selectedTerm_id !== "all" ? ` - ${terms?.find(t => t._id === selectedTerm_id)?.year || ''}` : ''}`}
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
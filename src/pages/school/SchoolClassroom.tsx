import DataTable from "../../components/school/data-table";
import { toast } from "sonner";
import useFetchData from "../../hooks/useFetchData";
import SchoolCreateClassroomModal from "../../components/school/school-classroomModal";
import SchoolClassroomDetailModal from "../../components/school/school-classroom-detail-modal";
import { useState } from "react";
import API from "../../lib/axios";
import { Button } from "../../components/ui/button";
import { Edit, Eye } from "lucide-react";


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


export default function SchoolClassroom() {

  const { data: classrooms, loading, refetch } = useFetchData<ClassroomType>("/classrooms");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  // const [editData, setEditData] = useState<ClassroomType | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<ClassroomType | null>(null);
  
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
      <Button onClick={() => setIsModalOpen(true)}>
        Create Classroom
      </Button>
      <DataTable
        key={classrooms?.length}
        data={classrooms?.map((classroom) => {
          return ({
            ...classroom,
            gradeName: classroom.grade?.name || 'No Grade',
            termName: classroom.term?.year || 'No Term',
            key: classroom._id,
          });
        }) || []}
        title="🏫 Classrooms"
        columns={[
          { label: "Name", key: "name" },
          { label: "Term", key: "termName" },
          { label: "Grade", key: "gradeName" },
          { label: "Created At", key: "createdAt" },

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
        onClose={() => setIsDetailModalOpen(false)}
        classroom={selectedClassroom}
      />
    </div>
  );
}
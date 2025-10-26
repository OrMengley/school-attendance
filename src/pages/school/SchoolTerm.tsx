import useFetchData from "../../hooks/useFetchData";
import DataTable from "../../components/school/data-table";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import SchoolCreateTermModal from "../../components/school/school-termModal";
import API from "../../lib/axios";
import { Edit } from "lucide-react";
import { getCurrentUser } from "../../utils/auth";

interface SchoolType {
  _id: string;
  name: string;
  address: string;
  createdAt: string;
}

interface DepartmentType {
  _id: string;
  name: string;
  school_id: string;
  createdAt: string;
  school: SchoolType;
}

interface TermType {
  _id: string;
  year: string;
  department_id: string;
  createdAt: string;
  department: DepartmentType;
}

export default function TermPage() {
  const user = getCurrentUser()
  const { data: terms, loading, refetch } = useFetchData<TermType>(`/terms?school_id=${user?.school_id}`);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  // const [selectedTerm, setSelectedTerm] = useState<TermType | null>(null);
  const [editData, setEditData] = useState<TermType | null>(null);

  const handleOpenCreate = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (term: TermType) => {
    setEditData(term);
    setIsModalOpen(true);
  };

  const handleSubmitTerm = (data: { _id?: string; year: string;  departmentId?: string }) => {
    console.log(data);
    API.post("/terms", data)
    .then((res:any) => {
      console.log(res);
      toast.success("Term created successfully");
      refetch();
      setIsModalOpen(false);
    })
    .catch((err: any) => {
      console.log(err);
      toast.error("Failed to create term");
    });
  };
  // const handleDeleteTerms = async (ids: string[]) => {
  //   try {
  //     // In a real application, you would call your API to delete the terms
  //     // Example: await axios.delete("/terms", { data: { ids } });
      
  //     console.log("Deleting terms with IDs:", ids);
  //     toast.success(`Successfully deleted ${ids.length} term(s)`);
      
  //     // Refetch data after deletion
  //     refetch();
  //   } catch (error) {
  //     console.error("Error deleting terms:", error);
  //     toast.error("Failed to delete terms");
  //   }
  //   console.log(terms);
  // };

  if (loading) return <p>Loading terms...</p>;

  return (
    <div>
      <Button onClick={handleOpenCreate}>Create Term</Button>
      <DataTable
      key={terms?.length || 0}
      data={terms?.map((term) => {
        return ({
          ...term,
          departmentName: term.department?.name || 'No Department',
          key: term._id,
        });
      }) || []}
      title="📅 Terms"
      columns={[
        { label: "Year", key: "year" },
        { label: "Department", key: "departmentName" },
        { label: "Created At", key: "createdAt" },
      ]
    }
    actions={
      (department) => (
          <div className="flex space-x-2">
              {/* <Button size="sm" variant="outline" onClick={() => handleOpenDetail(department)}>
                  <Eye className="h-4 w-4 mr-1" /> View
              </Button> */}
              <Button size="sm" variant="outline" onClick={() => handleOpenEdit(department)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
          </div>
      )
    }
    />
    <SchoolCreateTermModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      initialData={editData}
      onSubmit={handleSubmitTerm}
    />
    </div>
  );
}
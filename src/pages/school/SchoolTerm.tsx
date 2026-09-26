import useFetchData from "../../hooks/useFetchData";
import DataTable from "../../components/school/data-table";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import SchoolCreateTermModal from "../../components/school/school-termModal";
import API from "../../lib/axios";
import { Edit, Trash2, Plus, ArrowRight } from "lucide-react";
import { getCurrentUser } from "../../utils/auth";
import { Link, useNavigate } from "react-router-dom";
import type { TermType } from "../../types/Term";

export default function TermPage() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const { data: terms, loading, refetch } = useFetchData<TermType>(`/terms?school_id=${user?.school_id}`);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<TermType | null>(null);

  const handleOpenCreate = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (term: TermType) => {
    setEditData(term);
    setIsModalOpen(true);
  };

  const handleSubmitTerm = (data: { _id?: string; year: string; department_id?: string }) => {
    if (editData?._id) {
      API.put(`/terms/${editData._id}`, data)
        .then(() => {
          toast.success("Term updated successfully");
          refetch();
          setIsModalOpen(false);
        })
        .catch((err: any) => {
          console.error(err);
          toast.error(err.response?.data?.error || "Failed to update term");
        });
    } else {
      API.post("/terms", data)
        .then(() => {
          toast.success("Term created successfully");
          refetch();
          setIsModalOpen(false);
        })
        .catch((err: any) => {
          console.error(err);
          toast.error(err.response?.data?.error || "Failed to create term");
        });
    }
  };

  const handleDeleteTerm = async (term: TermType) => {
    if (!window.confirm(`Are you sure you want to move term "${term.year}" to trash?`)) {
      return;
    }

    try {
      await API.delete(`/terms/${term._id}`);
      toast.success(`Term "${term.year}" moved to trash`, {
        action: {
          label: "View Trash",
          onClick: () => navigate("/school/trash/term"),
        },
      });
      refetch();
    } catch (err: any) {
      console.error("Error moving term to trash:", err);
      toast.error(err.response?.data?.error || "Failed to move term to trash");
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!window.confirm(`Are you sure you want to move ${ids.length} selected term(s) to trash?`)) {
      return;
    }

    try {
      await API.post("/terms/trash", { ids });
      toast.success(`${ids.length} term(s) moved to trash`, {
        action: {
          label: "View Trash",
          onClick: () => navigate("/school/trash/term"),
        },
      });
      refetch();
    } catch (err: any) {
      console.error("Error moving terms to trash:", err);
      toast.error(err.response?.data?.error || "Failed to move terms to trash");
    }
  };

  if (loading && !terms) return <p className="p-4 text-muted-foreground">Loading terms...</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Create Term
        </Button>
        <Link to="/school/trash/term">
          <Button
            variant="outline"
            className="gap-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 hover:border-red-200"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
            Go to Term Trash
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      <DataTable
        key={terms?.length || 0}
        data={
          terms?.map((term) => ({
            ...term,
            departmentName: term.department?.name || "No Department",
            key: term._id,
          })) || []
        }
        title="📅 Terms"
        onDelete={handleBulkDelete}
        columns={[
          { label: "Year", key: "year" },
          { label: "Department", key: "departmentName" },
          { label: "Created At", key: "createdAt" },
        ]}
        actions={(term) => (
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenEdit(term)}
              className="h-8 gap-1 hover:bg-blue-50 hover:border-blue-200"
            >
              <Edit className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteTerm(term)}
              className="h-8 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
              title="Move to trash"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
          </div>
        )}
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
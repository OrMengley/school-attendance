import useFetchData from "../../hooks/useFetchData";
import DataTable from "../../components/school/data-table";

import { toast } from "sonner";
import SchoolCreateDeparmentModal from "../../components/school/school-departmentModal";
import DepartmentDetailModal from "../../components/school/school-department-detail-modal";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import API from "../../lib/axios";
import { Eye, Edit } from "lucide-react";
import type { DepartmentType } from "../../types/Department";

// interface SchoolType {
//   _id: string;
//   name: string;
//   address: string;
//   createdAt: string;
// }


export default function SchoolDepartment() {
  const { data: departments, loading, refetch } = useFetchData<DepartmentType>("/departments");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentType | null>(null);
  const [editData, setEditData] = useState<DepartmentType | null>(null);

  const handleOpenCreate = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (department: DepartmentType) => {
    setEditData(department);
    setIsModalOpen(true);
  };

  const handleOpenDetail = (department: DepartmentType) => {
    setSelectedDepartment(department);
    setIsDetailModalOpen(true);
  };

  const handleSubmit = async(data: { _id?: string; name: string;  schoolId?: string }) => {
    try {
      if (editData) {
          // Update existing grade
          await API.put(`/departments/${editData._id}`, data);
          toast.success("Department updated successfully");
      } else {
          // Create new grade
          await API.post("/departments", data);
          toast.success("Department created successfully");
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      console.error("Error saving department:", error);
      toast.error("Failed to save department");
    }
  };
  
 
  

  if (loading) return <p>Loading departments...</p>;

  // Handle null or undefined departments data
  const departmentsData = departments || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Departments Management</h1>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2">
          <span>Create Department</span>
        </Button>
      </div>
      
      <DataTable
        key={departmentsData.length}
        data={departmentsData.map((department) => {
          return ({
            ...department,
            schoolName: department.school?.name || 'Unknown School',
            key: department._id,
          });
        })}
        title="📅 Departments"
        columns={[
          { label: "Name", key: "name" },
          { label: "School", key: "schoolName" },
          { label: "Created At", key: "createdAt" },
        ]}
        actions={
          (department) => (
              <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleOpenDetail(department)}>
                      <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleOpenEdit(department)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
              </div>
          )
        }
        // onDelete={handleDeleteDepartments}
      />
      
      <SchoolCreateDeparmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editData}
      />
      
      <DepartmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        department={selectedDepartment}
      />
    </div>
  );
}
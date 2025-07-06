// src/components/UserTable.tsx
import useFetchData from "../../hooks/useFetchData";
import DataTable from "../../components/school/data-table";
import { toast } from "sonner";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  schoolId?: string;
}

export default function UserTable() {
  const { data: users, loading, refetch } = useFetchData<User>("/users");

  const handleDeleteUsers = async (ids: string[]) => {
    try {
      // In a real application, you would call your API to delete the users
      // Example: await axios.delete("/users", { data: { ids } });
      
      console.log("Deleting users with IDs:", ids);
      toast.success(`Successfully deleted ${ids.length} user(s)`);
      
      // Refetch data after deletion
      refetch();
    } catch (error) {
      console.error("Error deleting users:", error);
      toast.error("Failed to delete users");
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <DataTable
      data={users}
      title="👥 Users"
      columns={[
        { label: "Name", key: "name" },
        { label: "Email", key: "email" },
        { label: "Role", key: "role" },
        { label: "School", key: "schoolId" },
      ]}
      onDelete={handleDeleteUsers}
    />
  );
}
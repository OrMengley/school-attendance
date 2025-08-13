// // src/components/UserTable.tsx
// import useFetchData from "../../hooks/useFetchData";
// import DataTable from "../../components/school/data-table";
// import { toast } from "sonner";

// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   role: string;
//   schoolId?: string;
// }

// export default function UserTable() {
//   const { data: users, loading, refetch } = useFetchData<User>("/users");

//   const handleDeleteUsers = async (ids: string[]) => {
//     try {
//       console.log("Deleting users with IDs:", ids);
//       toast.success(`Successfully deleted ${ids.length} user(s)`);
      
//       // Refetch data after deletion
//       refetch();
//     } catch (error) {
//       console.error("Error deleting users:", error);
//       toast.error("Failed to delete users");
//     }
//   };

//   if (loading) return <p>Loading users...</p>;

//   return (
//     <DataTable
//       data={users}
//       title="👥 Users"
//       columns={
//         [
//         { label: "Name", key: "name" },
//         { label: "Email", key: "email" },
//         { label: "Role", key: "role" },
//         { label: "School", key: "schoolId" },
//       ]}
//     />
//   );
// }


// src/pages/school/SchoolUser.tsx (or wherever your UserTable lives)
import { useState } from "react";
import useFetchData from "../../hooks/useFetchData";
import { Button } from "../../components/ui/button";
import SchoolUserCreateModal from "../../components/school/school-createUserModal";
import SchoolUserEditModal from "../../components/school/School-userEditModal";
import type { EditUser } from "../../components/school/School-userEditModal";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId?: string;
}

export default function UserTable() {
  const { data: users, loading, refetch } = useFetchData<User>("/users");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  if (loading) return <p>Loading users...</p>;

  return (
    <>
      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">👥 Users</h2>
          <Button onClick={() => setCreateOpen(true)}>Create User</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">School</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2">{u.schoolId || "-"}</td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(u);
                        setEditOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create */}
      <SchoolUserCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refetch}
      />

      {/* Edit */}
      <SchoolUserEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={
          editing
            ? ({
                id: editing.id,
                name: editing.name,
                email: editing.email,
                role: editing.role as EditUser["role"],
                schoolId: editing.schoolId,
              } as EditUser)
            : null
        }
        onSaved={refetch}
      />
    </>
  );
}
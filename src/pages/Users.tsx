// src/components/UserTable.tsx
import { useEffect, useState } from "react";
import API from "../lib/axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId?: string;
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Failed to fetch users:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <h2>👥 Users</h2>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>School</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.schoolId ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
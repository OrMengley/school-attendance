import { useEffect, useState } from "react";
import API from "../lib/axios";
import { useNavigate } from "react-router-dom";

interface Department {
  _id: string;
  name: string;
}

export default function CreateTerm() {
  const [year, setYear] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/departments")
      .then((res) => setDepartments(res.data))
      .catch((err) => {
        console.error("Failed to load departments:", err);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/terms", { year, departmentId });
      alert("Term created!");
      navigate("/creator/department");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert("Failed to create term");
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div>
      <h2>Create Term</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Year (e.g., 2024)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        />
        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          required
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

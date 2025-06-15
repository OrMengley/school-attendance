import { useEffect, useState } from "react";
import API from "../lib/axios";
import { useNavigate } from "react-router-dom";

interface School {
  _id: string;
  name: string;
}

export default function CreateDepartment() {
  const [name, setName] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/schools").then((res) => {
      setSchools(res.data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/departments", { name, schoolId });
      alert("Department created!");
      navigate("/schools");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert("Failed to create department");
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div>
      <h2>Create Department</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Department Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)} required>
          <option value="">Select School</option>
          {schools.map((school) => (
            <option key={school._id} value={school._id}>
              {school.name}
            </option>
          ))}
        </select>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
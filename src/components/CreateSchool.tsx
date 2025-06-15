import { useState } from "react";
import API from "../lib/axios";
import { useNavigate } from "react-router-dom";

export default function CreateSchool() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/schools", { name, address });
      alert("School created successfully!");
      navigate("/schools"); // Redirect back to list
    } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : 'Unknown error');
      alert("Failed to create school");
    }
  };

  return (
    <div>
      <h2>Create New School</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="School Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
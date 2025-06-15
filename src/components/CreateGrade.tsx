import { useEffect, useState } from "react";
import API from "../lib/axios";
import { useNavigate } from "react-router-dom";


interface Term {
  _id: string;
  year: string;
}

export default function CreateGrade() {
  const [name, setName] = useState("");
  const [termId, setTermId] = useState("");
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    API.get("/terms")
      .then((res) => {
        setTerms(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch terms:", err);
        setTerms([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `grade-${Date.now()}`; // 🆔 unique string ID
    try {
      await API.post("/grades", { id, name, termId });
      alert("Grade created!");
      navigate("/creator/term");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert("Failed to create grade");
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div>
      <h2>Create Grade</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Grade Name (e.g., Grade 1)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {loading ? (
          <p>Loading terms...</p>
        ) : terms.length === 0 ? (
          <p>No terms available. Please create a term first.</p>
        ) : (
          <select
            value={termId}
            onChange={(e) => setTermId(e.target.value)}
            required
          >
            <option value="">Select Term</option>
            {terms.map((term) => (
              <option key={term._id} value={term._id}>
                {term.year}
              </option>
            ))}
          </select>
        )}
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

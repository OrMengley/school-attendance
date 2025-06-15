import { useEffect, useState } from "react";
import API from "../lib/axios";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
interface School {
  _id: string;
  name: string;
  address: string;
}

export default function Schools() {
  const [schools, setSchools] = useState<School[]>([]);

  useEffect(() => {
    API.get("/schools")
      .then((res) => {
        setSchools(res.data);
      })
      .catch((err: unknown) => {
        alert(`Failed to fetch schools: ${err instanceof Error ? err.message : 'Unknown error'}`);
      });
  }, []);

  return (
    <div>
      <h1>Schools</h1>
      <Link to="/creator/school">
        <Button>Create School</Button>
      </Link>

      <ul>
        {schools.map((school) => (
          <li key={school._id}>
            <strong>{school.name}</strong> - {school.address}
          </li>
        ))}
      </ul>
    </div>
  );
}
import { useEffect, useState } from "react";
import API from "../lib/axios";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Plus, School, MapPin, AlertCircle } from "lucide-react";
interface School {
  _id: string;
  name: string;
  address: string;
}

export default function Schools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    API.get("/schools")
      .then((res) => {
        // Ensure res.data is an array
        if (Array.isArray(res.data)) {
          setSchools(res.data);
        } else {
          setSchools([]);
          console.warn('API response is not an array:', res.data);
        }
        setError(null);
      })
      .catch((err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Failed to fetch schools:', err);
        setError(`Failed to fetch schools: ${errorMessage}`);
        setSchools([]); // Ensure schools is always an array
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schools</h1>
            <p className="text-muted-foreground mt-2">Manage and view all schools in the system</p>
          </div>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Create School
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schools</h1>
            <p className="text-muted-foreground mt-2">Manage and view all schools in the system</p>
          </div>
          <Link to="/creator/school">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create School
            </Button>
          </Link>
        </div>
        
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <School className="h-8 w-8 text-primary" />
            Schools
          </h1>
          <p className="text-muted-foreground mt-2">Manage and view all schools in the system</p>
        </div>
        <Link to="/creator/school">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create School
          </Button>
        </Link>
      </div>

      {schools.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <School className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No schools found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first school
            </p>
            <Link to="/creator/school">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create School
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {schools.length} {schools.length === 1 ? 'School' : 'Schools'}
              </Badge>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {schools.map((school) => (
              <Card key={school._id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <School className="h-5 w-5 text-primary" />
                    {school.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{school.address}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
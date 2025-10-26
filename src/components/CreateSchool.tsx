import { useState } from "react";
import API from "../lib/axios";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { School, ArrowLeft, Save } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function CreateSchool() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Generate a unique ID for the school
      const schoolData = {
        _id: uuidv4(),
        name: name.trim(),
        address: address.trim()
      };
      
      await API.post("/schools", schoolData);
      // Success - navigate back to schools list
      navigate("/view/school");
    } catch (err: any) {
      console.error('Failed to create school:', err);
      
      // Show more specific error message
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred';
      alert(`Failed to create school: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/schools")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Schools
        </Button>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <School className="h-8 w-8 text-primary" />
            Create New School
          </h1>
          <p className="text-muted-foreground mt-2">
            Add a new school to the system
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
          <CardDescription>
            Please provide the basic information for the new school
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">School Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter school name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
                maxLength={100}
              />
              {name.length > 80 && (
                <p className="text-sm text-muted-foreground">
                  {100 - name.length} characters remaining
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                type="text"
                placeholder="Enter complete school address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                disabled={isSubmitting}
                maxLength={200}
              />
              {address.length > 150 && (
                <p className="text-sm text-muted-foreground">
                  {200 - address.length} characters remaining
                </p>
              )}
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !name.trim() || !address.trim()}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Creating..." : "Create School"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/schools")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
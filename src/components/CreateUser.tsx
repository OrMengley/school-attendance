import { useState, useEffect } from "react";
import API from "../lib/axios";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { UserPlus, ArrowLeft, Save, Users, Eye, EyeOff } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import type {SchoolType} from "../types/SchoolType"


export default function CreateUser() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "" as "admin" | "teacher" | "parent" | "",
    school_id: ""
  });
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const navigate = useNavigate();

  // Fetch schools when role requires schoolId
  useEffect(() => {
    if (formData.role && ["admin", "teacher", "parent"].includes(formData.role)) {
      setLoadingSchools(true);
      API.get("/schools")
        .then((res) => {
          if (Array.isArray(res.data)) {
            setSchools(res.data);
          } else {
            setSchools([]);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch schools:', err);
          setSchools([]);
        })
        .finally(() => {
          setLoadingSchools(false);
        });
    } else {
      setSchools([]);
      setFormData(prev => ({ ...prev, school_id: "" }));
    }
  }, [formData.role]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.password) return "Password is required";
    if (!formData.role) return "Role is required";
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Please enter a valid email";
    
    // Password validation
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    
    // School validation for specific roles
    if (["admin", "teacher", "parent"].includes(formData.role) && !formData.school_id) {
      return "School selection is required for this role";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare user data for backend
      const userData = {
        _id: uuidv4(), // Generate UUID for backend
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        school_id: formData.school_id,
        role: formData.role,
        ...(formData.school_id && { SchoolID: formData.school_id })
      };
      
      await API.post("/users", userData);
      // Success - navigate back to users list
      navigate("/view/users");
    } catch (err: any) {
      console.error('Failed to create user:', err);
      
      // Show more specific error message
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred';
      alert(`Failed to create user: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.name.trim() && 
           formData.email.trim() && 
           formData.password && 
           formData.role &&
           (!["admin", "teacher", "parent"].includes(formData.role) || formData.school_id);
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin": return "School administrators can manage school data, users, and settings";
      case "teacher": return "Teachers can manage classrooms, take attendance, and view reports";
      case "parent": return "Parents can view their children's attendance and receive notifications";
      default: return "Select a role to see description";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/users")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserPlus className="h-8 w-8 text-primary" />
            Create New User
          </h1>
          <p className="text-muted-foreground mt-2">
            Add a new user to the system
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Information
          </CardTitle>
          <CardDescription>
            Please provide the user details and select appropriate role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter user's full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                disabled={isSubmitting}
                maxLength={100}
              />
            </div>
            
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                disabled={isSubmitting}
                maxLength={100}
              />
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password (min. 6 characters)"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  disabled={isSubmitting}
                  minLength={6}
                  maxLength={50}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {formData.password && formData.password.length < 6 && (
                <p className="text-sm text-destructive">
                  Password must be at least 6 characters
                </p>
              )}
            </div>
            
            {/* Role Field */}
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => handleInputChange("role", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">School Administrator</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                </SelectContent>
              </Select>
              {formData.role && (
                <p className="text-sm text-muted-foreground">
                  {getRoleDescription(formData.role)}
                </p>
              )}
            </div>
            
            {/* School Field - Only show for specific roles */}
            {["admin", "teacher", "parent"].includes(formData.role) && (
              <div className="space-y-2">
                <Label htmlFor="school">School *</Label>
                <Select 
                  value={formData.school_id} 
                  onValueChange={(value) => {
                    handleInputChange("school_id", value);
                    console.log("school_id", value)
                  }}
                  disabled={isSubmitting || loadingSchools}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        loadingSchools 
                          ? "Loading schools..." 
                          : schools.length === 0 
                            ? "No schools available" 
                            : "Select school"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school._id} value={school._id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {schools.length === 0 && !loadingSchools && (
                  <p className="text-sm text-muted-foreground">
                    No schools available. Please create a school first.
                  </p>
                )}
              </div>
            )}
            
            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !isFormValid()}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Creating..." : "Create User"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/users")}
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
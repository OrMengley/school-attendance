import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerDescription,
} from "../../components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";

import { Calendar, GraduationCap, School, Clock, Hash, Users, Plus, Search, User, Phone, UserCheck, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import API from "../../lib/axios";
import { toast } from "sonner";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import useFetchData from "../../hooks/useFetchData";


export interface Enrollment {
  termId: string;
  classroomId: string;
}

export type StudentStatus = "active" | "inactive";

export interface StudentType {
  _id: string; // ✅ Matches MongoDB _id
  name: string;
  firstName?: string;
  lastName?: string;
  dob?: string; // ISO format string like "2025-06-19"
  address?: string;
  profileUrl?: string;
  parentPhone: string;
  sex?: "male" | "female";
  status?: StudentStatus;
  classroomId?: string; // current classroomId
  termId?: string; // current termId
  enrollments: Enrollment[];
  createdAt: string; // ISO string from MongoDB
}

interface TermType {
  _id: string;
  year: string;
  departmentId: string;
  createdAt: string;
}

interface GradeType {
  _id: string;
  name: string;
  termId: string;
  schoolId?: string;
  createdAt: string;
  term: TermType;
}


export interface SessionType {
  _id: string;
  subjecName: string;
  teacherId: string;
  sessionHourStart:string;
  sessionMinStart:string;
  sessionHourEnd:string;
  sessionMinEnd:string;
}
interface ClassroomType {
  _id: string;
  name: string;
  gradeId: string;
  termId: string;
  createdAt: string;
  grade: GradeType;
  term: TermType;
  studentIds:string[];
  sessions: SessionType[];
  
}

interface ClassroomDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: ClassroomType | null;
}

export default function SchoolClassroomDetailModal({
  isOpen,
  onClose,
  classroom,
}: ClassroomDetailModalProps) {
  if (!classroom) return null;
  const { data: allStudents} = useFetchData<StudentType>("/students");
  const [studentsByClassroom, setStudentsByClassroom] = useState<StudentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'details' | 'students'>('details');

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn("Invalid date format:", dateString);
      return 'Invalid Date';
    }
  };

  const fetchStudentsByClassroomAndTerm = async (classroomId: string, termId: string) => {
    try {
      setLoading(true);
      const response =  await API.get(`/students/classroom/${classroomId}/term/${termId}`);
      // Add null check for response data
      if (response.data && Array.isArray(response.data)) {
        setStudentsByClassroom(response.data);
        
      } else {
        // console.warn("Invalid students data received:", response.data);
        setStudentsByClassroom([]);
        toast.error("Invalid data format received");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
      setStudentsByClassroom([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

 
  const handleStudentSelection = (studentId: string, isChecked: boolean) => {
    if (!studentId) {
      console.warn("Attempted to select student with null/undefined ID");
      return;
    }
    
    if (isChecked) {
      setSelectedStudentIds(prev => [...prev, studentId]);
    } else {
      setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
    }
  };

  // const handleAddStudents = async () => {
  //   if (!classroom?._id || !classroom?.term?._id) {
  //     toast.error("Invalid classroom or term data");
  //     return;
  //   }

  //   if (selectedStudentIds.length === 0) {
  //     toast.error("No students selected");
  //     return;
  //   }

  //   try {
  //     // Update each student individually with the new classroom and term
  //     for (const studentId of selectedStudentIds) {
  //       if (!studentId) {
  //         console.warn("Skipping null/undefined student ID");
  //         continue;
  //       }
        
  //       await API.put(`/students/${studentId}`, {
  //         classroomId: classroom._id,
  //         termId: classroom.term._id,
  //         enrollments: [
  //           {
  //             termId: classroom.term._id,
  //             classroomId: classroom._id,
  //           },
  //         ],
  //       });
  //     }

  //     toast.success(`${selectedStudentIds.length} students added to classroom`);
  //     fetchStudentsByClassroomAndTerm(classroom?._id || '', classroom?.term?._id || ''); // Refresh student list
  //     handleStudentModalClose(); // Close the modal
  //   } catch (error) {
  //     console.error("Error adding students to classroom:", error);
  //     toast.error("Failed to add students to classroom");
  //   }
  // };
  const handleAddStudents = async () => {
    if (!classroom?._id || !classroom?.term?._id) {
      toast.error("Invalid classroom or term data");
      return;
    }
  
    if (selectedStudentIds.length === 0) {
      toast.error("No students selected");
      return;
    }
    try {
      await Promise.all(
        selectedStudentIds.map((studentId) =>
          API.put(`/students/${studentId}/classroom`, {
            classroomId: classroom._id,
            termId: classroom.term._id,
          })
        )
      );
  
      toast.success(`${selectedStudentIds.length} students added to classroom`);
      fetchStudentsByClassroomAndTerm(classroom._id, classroom.term._id); // Refresh
      handleStudentModalClose(); // Close modal
    } catch (error) {
      // console.error("Error adding students to classroom:", error);
      toast.error("Failed to add students to classroom");
    }
  };

  // const getAvailableStudents = () => {
    
  //   if (!students || !Array.isArray(students)) {
  //     console.warn("Students data is not available or not an array");
  //     return [];
  //   }

  //   if (!classroom?.studentIds || !Array.isArray(classroom.studentIds)) {
      
  //     return students.filter(student => student && student._id); // Return all valid students
  //   }

  //   // Filter out students who are already in this classroom
  //   return students.filter(student => 
  //     student && 
  //     student._id && 
  //     !classroom.studentIds.includes(student._id)
  //   );
  // };

  // const getEnrolledStudents = () => {
  //   // Check if students array exists and is valid
  //   if (!students || !Array.isArray(students)) {
  //     console.warn("Students data is not available or not an array");
  //     return [];
  //   }

  //   // Check if classroom.studentIds exists and is valid
  //   if (!classroom?.studentIds || !Array.isArray(classroom.studentIds)) {
      
  //     return [];
  //   }

  //   // Filter with null checks
  //   return students.filter(student => 
  //     student && 
  //     student._id && 
  //     classroom.studentIds.includes(student._id)
  //   );
  // };

  // const getFilteredStudents = () => {
  //   const availableStudents = getAvailableStudents();
    
  //   if (!searchTerm.trim()) {
  //     return availableStudents;
  //   }

  //   const searchLower = searchTerm.toLowerCase();
  //   return availableStudents.filter(student => {
  //     if (!student) return false;
      
  //     return (
  //       (student.name && student.name.toLowerCase().includes(searchLower)) ||
  //       (student.firstName && student.firstName.toLowerCase().includes(searchLower)) ||
  //       (student.lastName && student.lastName.toLowerCase().includes(searchLower)) ||
  //       (student.parentPhone && student.parentPhone.includes(searchTerm)) ||
  //       (student.sex && student.sex.toLowerCase().includes(searchLower))
  //     );
  //   });
  // };

  const handleStudentModalClose = () => {
    setIsStudentModalOpen(false);
    setSelectedStudentIds([]);
    setSearchTerm("");
  };

  useEffect(() => {
 
    if (isOpen) {
      
      fetchStudentsByClassroomAndTerm(classroom?._id || '', classroom?.term?._id || '');
    }
  }, []);

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="">
        <DrawerHeader className="border-b">
          <DrawerTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            {classroom?.name || 'Unknown Classroom'} - Classroom Management
          </DrawerTitle>
          <DrawerDescription>
            Manage classroom details and student enrollment
          </DrawerDescription>
        </DrawerHeader>
        
        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Classroom Details
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'students'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Students ({studentsByClassroom.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* Classroom Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Hash className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">បន្ទប់សិក្សា</p>
                    <p className="text-lg font-semibold">{classroom?.name || 'No Name'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-600">កម្រិតសិក្សា</p>
                    <p className="text-lg font-semibold">{classroom?.grade?.name || 'No Grade'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-600">ឆ្នាំសិក្សា</p>
                    <p className="text-lg font-semibold">{classroom?.term?.year || 'No Term'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-purple-600">បង្កើតនៅ</p>
                    <p className="text-sm">{formatDate(classroom?.createdAt || '')}</p>
                  </div>
                </div>
              </div>

              {/* Student Summary */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 rounded-full p-3">
                      <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Student Enrollment</h3>
                      <p className="text-sm text-gray-600">
                        {studentsByClassroom.length} students currently enrolled
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setIsStudentModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Students
                  </Button>
                </div>
              </div>

              {/* Sessions Information */}
              {classroom?.sessions && classroom.sessions.length > 0 && (
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Class Sessions</h3>
                  <div className="space-y-3">
                    {classroom.sessions.map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Teacher ID: {session?.teacherId || 'Unknown'}</p>
                        </div>
                        <div className="text-right">
                          {/* <p className="text-sm font-medium">{session.sessionStart} - {session.sessionEnd}</p> */}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Students Table Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Enrolled Students</h3>
                  <p className="text-sm text-gray-600">
                    {studentsByClassroom.length} students in this classroom
                  </p>
                </div>
                <Button 
                  onClick={() => setIsStudentModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add More Students
                </Button>
              </div>

              {/* Students Table */}
              <div className="bg-white rounded-lg border">
                {loading ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">Loading students...</p>
                  </div>
                ) : studentsByClassroom.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No students enrolled yet</p>
                    <Button 
                      onClick={() => setIsStudentModalOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Student
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Date of Birth</TableHead>
                        <TableHead>Parent Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentsByClassroom.map((student, index) => {
                        if (!student || !student._id) {
                          console.warn("Found null/undefined student in enrolled students");
                          return null;
                        }
                        
                        return (
                          <TableRow key={student._id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {student.profileUrl ? (
                                  <img 
                                    src={student.profileUrl} 
                                    alt={student.name || 'Student'}
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="h-4 w-4 text-gray-500" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{student.name || 'Unnamed Student'}</p>
                                  {(student.firstName || student.lastName) && (
                                    <p className="text-sm text-gray-500">
                                      {student.firstName || ''} {student.lastName || ''}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={student.sex === 'male' ? 'default' : 'secondary'}>
                                {student.sex || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                {student.parentPhone || 'No phone'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={student.status === 'active' ? 'default' : 'destructive'}
                                className="flex items-center gap-1 w-fit"
                              >
                                {student.status === 'active' ? (
                                  <UserCheck className="h-3 w-3" />
                                ) : (
                                  <UserX className="h-3 w-3" />
                                )}
                                {student.status || 'active'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Add logic to remove student from classroom
                                  console.log("Remove student:", student._id);
                                }}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      }).filter(Boolean)}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}
        </div>
        
        <DrawerFooter className="border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
      
      {/* Student Selection Modal */}
      <Dialog open={isStudentModalOpen} onOpenChange={handleStudentModalClose}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogDescription>
            Add students to {classroom?.name || 'Classroom'}
          </DialogDescription>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Add Students to {classroom?.name || 'Classroom'}
            </DialogTitle>
          </DialogHeader>
          
          {/* Search Input */}
          <div className="px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search students by name, phone, or gender..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-500 mt-2">
                Found {allStudents?.length} students matching "{searchTerm}"
              </p>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto px-6">
            {loading ? (
              <p className="text-center py-4">Loading students...</p>
            ) : (
              <div className="space-y-2">
                {allStudents?.length === 0 ? (
                  <div className="text-center py-8">
                    {searchTerm ? (
                      <div>
                        <p className="text-gray-500">No students found matching "{searchTerm}"</p>
                        <Button 
                          variant="link" 
                          onClick={() => setSearchTerm("")}
                          className="mt-2"
                        >
                          Clear search
                        </Button>
                      </div>
                    ) : (
                      <p className="text-gray-500">No available students to add</p>
                    )}
                  </div>
                ) : (
                  allStudents?.map((student) => {
                    if (!student || !student._id) {
                      console.warn("Found null/undefined student in filtered students");
                      return null;
                    }
                    return (
                      <div key={student._id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <Checkbox
                          id={student._id}
                          checked={selectedStudentIds.includes(student._id)}
                          onCheckedChange={(checked) => handleStudentSelection(student._id, checked as boolean)}
                        />
                        {student.profileUrl ? (
                          <img 
                            src={student.profileUrl} 
                            alt={student.name || 'Student'}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm font-medium">
                              {(student.name || 'S').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <label htmlFor={student._id} className="flex-1 cursor-pointer">
                          <div>
                            <p className="font-medium">{student.name || 'Unnamed Student'}</p>
                            <p className="text-sm text-gray-500">
                              {student.sex || 'N/A'} • {student.dob ? new Date(student.dob).toLocaleDateString() : 'No DOB'} • {student.parentPhone || 'No phone'}
                            </p>
                          </div>
                        </label>
                      </div>
                    );
                  }).filter(Boolean)
                )}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-between px-6 py-4">
            <p className="text-sm text-gray-500 self-center">
              {selectedStudentIds.length} students selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleStudentModalClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddStudents}
                disabled={selectedStudentIds.length === 0}
              >
                Add {selectedStudentIds.length} Students
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Drawer>
  );
} 
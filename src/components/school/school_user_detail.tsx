import React, { useState, useEffect } from 'react';
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  Users, 
  BookOpen, 
  Clock, 
  UserCheck, 
  UserX,
  X,
  Eye
} from "lucide-react";
// Import Drawer components instead of Dialog
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../../components/ui/drawer";
import type { UserType } from "../../types/User";
import type { StudentType } from "../../types/Student";
import type { ClassroomType } from "../../types/Classroom";
import API from "../../lib/axios";

interface UserDetailProps {
  user: UserType | null;
  open: boolean;
  onClose: () => void;
}

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'super_admin': return 'destructive';
    case 'admin': return 'default';
    case 'teacher': return 'secondary';
    case 'parent': return 'outline';
    default: return 'outline';
  }
};

const getStatusBadgeVariant = (status: string) => {
  return status === 'active' ? 'default' : 'secondary';
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function UserDetail({ user, open, onClose }: UserDetailProps) {
  const [studentDetails, setStudentDetails] = useState<Record<string, StudentType>>({});
  const [classroomDetails, setClassroomDetails] = useState<Record<string, ClassroomType>>({});
  const [loading, setLoading] = useState(false);
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);

  // Fetch student details when user has subscribed students
  useEffect(() => {
    console.log('User detail mounted with user:', user)
    const fetchStudentDetails = async () => {
      if (!user || !user.subscribedStudents || user.subscribedStudents.length === 0) {
        return;
      }

      setLoading(true);
      try {
        // Fetch all student details
        const studentPromises = user.subscribedStudents.map(studentId =>
          API.get<StudentType>(`/students/${studentId}`).then(res => res.data)
        );
        
        const students = await Promise.all(studentPromises);
        
        // Create a map of studentId to student details
        const studentMap: Record<string, StudentType> = {};
        students.forEach(student => {
          studentMap[student._id] = student;
        });
        
        setStudentDetails(studentMap);
        
        // Fetch classroom details for students
        const classroomIds = [...new Set(students.map(s => s.classroom_id).filter(Boolean))] as string[];
        if (classroomIds.length > 0) {
          const classroomPromises = classroomIds.map(classroomId =>
            API.get<ClassroomType>(`/classrooms/${classroomId}`).then(res => res.data)
          );
          
          const classrooms = await Promise.all(classroomPromises);
          
          // Create a map of classroomId to classroom details
          const classroomMap: Record<string, ClassroomType> = {};
          classrooms.forEach(classroom => {
            classroomMap[classroom._id] = classroom;
          });
          
          setClassroomDetails(classroomMap);
        }
      } catch (error) {
        console.error('Failed to fetch student details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open && user) {
      fetchStudentDetails();
    }
  }, [open, user]);

  if (!user) {
    return null;
  }

  const roleDisplay = {
    'super_admin': 'Super Administrator',
    'admin': 'School Administrator',
    'teacher': 'Teacher',
    'parent': 'Parent'
  }[user.role] || user.role;

  // Split name into first and last name
  const nameParts = user.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return (
    <>
      <Drawer open={open} onOpenChange={onClose}>
        <DrawerContent className="">
          <DrawerHeader className="p-6 pb-0">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    {user.avatar_url ? (
                      <AvatarImage src={user.avatar_url} alt={user.name} className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {user.avatar_url && (
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => setAvatarPreviewOpen(true)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div>
                  <DrawerTitle className="text-2xl">{user.name}</DrawerTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getRoleBadgeVariant(user.role)} className="font-medium">
                      {roleDisplay}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(user.status || 'active')} className="gap-1 font-medium">
                      {(user.status || 'active') === 'active' ? (
                        <UserCheck className="h-3 w-3" />
                      ) : (
                        <UserX className="h-3 w-3" />
                      )}
                      {(user.status || 'active').charAt(0).toUpperCase() + (user.status || 'active').slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              {/* User Information Card */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">First Name</p>
                      <p className="font-medium">{firstName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Name</p>
                      <p className="font-medium">{lastName}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <Mail className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user.email || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  {/* <Separator />
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="font-medium font-mono text-sm">{user._id}</p>
                    </div>
                  </div> */}
                  
                  {/* Password field - normally not shown in UI but added as requested */}
                  {/* <Separator />
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Password</p>
                      <p className="font-medium">••••••••</p>
                    </div>
                  </div> */}
                </CardContent>
              </Card>

              {/* Enrollment Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Enrollments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.enrollments && user.enrollments.length > 0 ? (
                    <div className="space-y-3">
                      {user.enrollments.map((enrollment, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">Enrollment {index + 1}</span>
                          </div>
                          <p className="text-xs text-gray-500 font-mono">Term ID: {enrollment.term_id}</p>
                          <p className="text-xs text-gray-500 font-mono">Classroom ID: {enrollment.classroom_id}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No enrollments found</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Classroom Assignments */}
            {user.classroomIds && user.classroomIds.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Classroom Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.classroomIds.map((classroomId, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">Classroom {index + 1}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-mono">ID: {classroomId}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subscribed Students */}
            {user.subscribedStudents && user.subscribedStudents.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Subscribed Students ({user.subscribedStudents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center items-center h-24">
                      <p>Loading student details...</p>
                    </div>
                  ) : Object.keys(studentDetails).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.subscribedStudents.map((studentId, index) => {
                        const student = studentDetails[studentId];
                        if (!student) return null;
                        
                        const classroom = student.classroom_id ? classroomDetails[student.classroom_id] : null;
                        
                        return (
                          <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                {student.profileUrl ? (
                                  <AvatarImage src={student.profileUrl} alt={student.name} className="object-cover" />
                                ) : (
                                  <AvatarFallback className="text-xs">
                                    {getInitials(student.name)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{student.name}</h3>
                                <p className="text-xs text-gray-500 font-mono truncate">ID: {student._id}</p>
                                
                                <div className="mt-2 space-y-1">
                                  {student.parentPhone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-3 w-3 text-gray-400" />
                                      <span className="text-xs text-gray-600">{student.parentPhone}</span>
                                    </div>
                                  )}
                                  
                                  {classroom && (
                                    <div className="flex items-center gap-1">
                                      <BookOpen className="h-3 w-3 text-gray-400" />
                                      <span className="text-xs text-gray-600">{classroom.name}</span>
                                    </div>
                                  )}
                                  
                                  {student.createdAt && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3 text-gray-400" />
                                      <span className="text-xs text-gray-600">
                                        Created: {formatDate(student.createdAt)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">No student details available</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Subscription Expiry Information */}
            {user.subscriptionMap && Object.keys(user.subscriptionMap).length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Subscription Expiry Dates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(user.subscriptionMap).map(([studentId, expiryTimestamp], index) => {
                      const expiryDate = new Date(expiryTimestamp);
                      const now = new Date();
                      const isExpired = expiryDate < now;
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Student ID: {studentId.substring(0, 8)}...</p>
                            <p className="text-sm text-gray-500">
                              Expires: {expiryDate.toLocaleDateString()} at {expiryDate.toLocaleTimeString()}
                            </p>
                          </div>
                          <Badge variant={isExpired ? "destructive" : "default"}>
                            {isExpired ? "Expired" : "Active"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Avatar Preview Dialog - keeping this as a dialog since it's a modal overlay */}
      <Drawer open={avatarPreviewOpen} onOpenChange={setAvatarPreviewOpen}>
        <DrawerContent className="w-full max-w-2xl mx-auto h-[90vh] flex flex-col">
          <DrawerHeader className="p-6 pb-0">
            <div className="flex justify-between items-center">
              <DrawerTitle>Profile Picture</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" onClick={() => setAvatarPreviewOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="flex-1 flex items-center justify-center p-6">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.name} 
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
                <User className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
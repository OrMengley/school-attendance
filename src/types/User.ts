// src/types/User.ts
export interface UserType {
    id: string;
    name: string;
    email: string;
    password?: string; // optional (you won't use it in UI)
    role: "super_admin" | "admin" | "teacher" | "parent";
    schoolId?: string;
    classroomIds?: string[];
    subscribedStudents?: string[];
    subscriptionMap?: Record<string, number>; // studentId → expiry timestamp
  }
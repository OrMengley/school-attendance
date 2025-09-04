// src/types/User.ts
export interface UserType {
    _id: string;
    name: string;
    email: string;
    password?: string; // optional (you won't use it in UI)
    role: "super_admin" | "admin" | "teacher" | "parent";
    school_id?: string;
    classroomIds?: string[];
    subscribedStudents?: string[];
    subscriptionMap?: Record<string, number>; // studentId → expiry timestamp
  }
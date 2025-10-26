// src/types/User.ts
import type { Enrollment } from "./Student";
export interface UserType {
    _id: string;
    name: string;
    email: string;
    status?: "active" | "inactive";
    password?: string; // optional (you won't use it in UI)
    role: "super_admin" | "admin" | "teacher" | "parent";
    school_id?: string;
    enrollments?: Enrollment[];
    classroomIds?: string[];
    subscribedStudents?: string[];
    subscriptionMap?: Record<string, number>; // studentId → expiry timestamp
  }
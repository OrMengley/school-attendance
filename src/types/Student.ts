import type { ClassroomType } from "./Classroom";
import type { TermType } from "./Term";

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
    classroom_id?: string; // current classroomId
    term_id?: string; // current termId
    enrollments: Enrollment[];
    createdAt: string; // ISO string from MongoDB
    classroom?: ClassroomType;
    term?: TermType;
  }
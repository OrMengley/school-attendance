

import type { GradeType } from "./Grade";
import type { TermType } from "./Term";
import type { SessionType } from "./Session";
export interface ClassroomType {
    _id: string;
    name: string;
    grade_id: string;
    term_id: string;
    school_id: string;
    department_id: string;
    createdAt: string;
    grade?: GradeType;
    teacherIds?: string[];
    studentIds?:string[];
    term?: TermType;
    sessions?: SessionType[];
  }
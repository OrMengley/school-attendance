

import type { GradeType } from "./Grade";
import type { TermType } from "./Term";
import type { SessionType } from "./Session";
export interface ClassroomType {
    _id: string;
    name: string;
    grade_id: string;
    term_id: string;
    createdAt: string;
    grade: GradeType;
    studentIds:string[];
    term: TermType;
    sessions: SessionType[];
  }
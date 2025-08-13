

import type { GradeType } from "./Grade";
import type { TermType } from "./Term";
import type { SessionType } from "./Session";
export interface ClassroomType {
    _id: string;
    name: string;
    gradeId: string;
    termId: string;
    createdAt: string;
    grade: GradeType;
    studentIds:string[];
    term: TermType;
    sessions: SessionType[];
  }
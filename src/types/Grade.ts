import type {TermType} from "./Term";

export interface GradeType {
    _id: string;
    name: string;
    termId: string;
    schoolId?: string;
    createdAt: string;
    term: TermType;
}
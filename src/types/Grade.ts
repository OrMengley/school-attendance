import type {TermType} from "./Term";

export interface GradeType {
    _id: string;
    name: string;
    term_id: string;
    school_id?: string;
    createdAt: string;
    term: TermType;
}
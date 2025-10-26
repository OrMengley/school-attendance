import type {TermType} from "./Term";
import type {DepartmentType} from "./Department";
import type {SchoolType} from "./SchoolType";
export interface GradeType {
    _id: string;
    name: string;
    department_id: string;
    term_id: string;
    school_id: string;
    createdAt: string;
    term?: TermType;
    department?: DepartmentType;
    school?: SchoolType;
}
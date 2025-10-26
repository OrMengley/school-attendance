import type { SchoolType } from "./SchoolType";

export interface DepartmentType {
  _id: string;
  name: string;
  school_id: string;
  createdAt: string;
  school: SchoolType;
}
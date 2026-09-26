import type { DepartmentType } from "./Department";

export interface TermType {
  _id: string;
  year: string;
  department_id: string;
  deleted?: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt?: string;
  department?: DepartmentType;
  departmentName?: string;
}
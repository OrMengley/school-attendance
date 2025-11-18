


export type Location ={
  type : string; // alway point
  coordinates: Float64Array[];
}

export interface SchoolType {
    _id: string;
    name: string;
    address: string;
    location ?: Location;
    createdAt?: string;
    updatedAt?: string;
    logo_url?: string;
    is_updating?: boolean;
    is_active?: boolean;
    is_deleted?: boolean;
    doc_files?: string[];
  }
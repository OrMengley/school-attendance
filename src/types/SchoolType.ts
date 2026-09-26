export type Location = {
  type: string; // always Point
  coordinates: Float64Array[];
};

export interface SchoolType {
  _id: string;
  name: string;
  address: string;
  location?: Location;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  logo_url?: string;
  is_updating?: boolean;
  is_active?: boolean;
  is_deleted?: boolean;
  doc_files?: string[];
}

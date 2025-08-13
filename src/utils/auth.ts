export type LoggedInUser = {
    id: string;
    name: string;
    email: string;
    role: "super_admin" | "admin" | "teacher" | "parent";
    schoolId?: string;
  };
  
  export function getCurrentUser(): LoggedInUser | null {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      return JSON.parse(raw) as LoggedInUser;
    } catch {
      return null;
    }
  }
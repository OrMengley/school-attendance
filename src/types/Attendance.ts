export type AttendanceType = {
    _id: string;
    student_id: string;
    classroom_id: string;
    session_id?: string;
    teacher_id: string;
    term_id: string;
    school_id: string;
    department_id: string;
    date: string; // YYYY-MM-DD
    status: "checkin" | "checkout";
    checkinTime?: string;  // ISO
    checkoutTime?: string; // ISO
  };
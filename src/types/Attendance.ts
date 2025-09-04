export type AttendanceType = {
    _id: string;
    student_id: string;
    classroom_id: string;
    session_id?: string;
    date: string; // YYYY-MM-DD
    status: "checkin" | "checkout";
    checkinTime?: string;  // ISO
    checkoutTime?: string; // ISO
  };
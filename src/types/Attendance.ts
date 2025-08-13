export type AttendanceType = {
    _id: string;
    studentId: string;
    classroomId: string;
    sessionId?: string;
    date: string; // YYYY-MM-DD
    status: "checkin" | "checkout";
    checkinTime?: string;  // ISO
    checkoutTime?: string; // ISO
  };
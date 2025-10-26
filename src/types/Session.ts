export interface SessionType {
    _id: string; // primary key
    sessionStatus?: "active" | "close";
    sessionDay: string;
    subjectName: string;
    teacher_id: string; // foreign key
    sessionStartHour: string;
    sessionStartMin: string;
    sessionEndHour: string;
    sessionEndMin: string;
  }
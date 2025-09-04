export interface SessionType {
    _id: string; // primary key
    sessionDay: string;
    subjectName: string;
    teacher_id: string; // foreign key
    sessionStartHour: string;
    sessionStartMin: string;
    sessionEndHour: string;
    sessionEndMin: string;
  }
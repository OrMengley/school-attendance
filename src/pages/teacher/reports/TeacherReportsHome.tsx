// src/pages/teacher/reports/TeacherReportsHome.tsx
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Link } from "react-router-dom";

export default function TeacherReportsHome() {
  const items = [
    { to: "/teacher/reports/daily", title: "Daily Attendance" },
    { to: "/teacher/reports/student-summary", title: "Student Attendance Summary" },
    { to: "/teacher/reports/classroom-analytics", title: "Classroom Analytics" },
    { to: "/teacher/reports/term", title: "Monthly/Term Report" },
    { to: "/teacher/reports/alerts", title: "Alerts & Exceptions" },
  ];
  return (
    <div className="p-4 grid gap-3">
      {items.map((i) => (
        <Link to={i.to} key={i.to}>
          <Card className="active:scale-[.99] transition">
            <CardHeader><CardTitle className="text-base">{i.title}</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Tap to open →
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
import "./App.css";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import { SidebarProvider } from "./components/ui/sidebar";
import { UserProvider } from "./context/UserContext";
import RequireAuth from "./components/RequireAuth";

// Layouts
import Home from "./pages/Home";
import Login from "./pages/Login";
import SchoolLayout from "./pages/SchoolLayout";
import ParentLayout from "./pages/ParentLayout";
import TeacherLayout from "./pages/TeacherLayout";

// Super Admin Pages
import UserPage from "./pages/Users";
import SchoolPage from "./pages/Schools";
import CreateSchoolPage from "./components/CreateSchool.tsx";
import CreateUserPage from "./components/CreateUser.tsx";
import CreateClassPage from "./components/CreateClass.tsx";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherClassroomAttendance from "./pages/teacher/TeacherClassroomAttendance";
import TeacherProfile from "./pages/teacher/TeacherProfile";

// School Pages
import SchoolDashboard from "./pages/school/SchoolDashboard";
import SchoolTerm from "./pages/school/SchoolTerm";
import SchoolClassroom from "./pages/school/SchoolClassroom";
import SchoolDepartment from "./pages/school/SchoolDepartment";
import SchoolGrade from "./pages/school/SchoolGrade";
import SchoolStudent from "./pages/school/SchoolStudent";
import SchoolStudentDetail from "./pages/school/SchoolStudentDetail";
import SchoolEnrollment from "./pages/school/SchoolEnrollment";
import SchoolStudentEnrollmentDetail from "./pages/school/SchoolStudentEnrollmentDetail";
import SchoolUser from "./pages/school/SchoolUser";
import SchoolUserTrash from "./pages/school/SchoolUserTrash";
import SchoolClassroomTrash from "./pages/school/SchoolClassroomTrash";
import SchoolDepartmentTrash from "./pages/school/SchoolDepartmentTrash";
import SchoolGradeTrash from "./pages/school/SchoolGradeTrash";
import SchoolStudentTrash from "./pages/school/SchoolStudentTrash";
import SchoolTermTrash from "./pages/school/SchoolTermTrash";
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentChildAttendance from "./pages/parent/ParentChildAttendance";
import SchoolParents from "./pages/school/SchoolParent";
import SchoolGeneralSettings from "./pages/school/SchoolGeneralSettings";
import AccessDenied from "./pages/AccessDenied";
import TeacherReportsHome from "./pages/teacher/reports/TeacherReportsHome";
import ReportDailyAttendance from "./pages/teacher/reports/ReportDailyAttendance";
import ReportStudentSummary from "./pages/teacher/reports/ReportStudentSummary";
import ReportClassroomAnalytics from "./pages/teacher/reports/ReportClassroomAnalytics";
import ReportStudentProfile from "./pages/teacher/reports/ReportStudentProfile";
import ReportTerm from "./pages/teacher/reports/ReportTerm";
import ReportAlerts from "./pages/teacher/reports/ReportAlerts";

function App() {
  return (
    // <React.StrictMode>
    //   <UserProvider>
    //     <SidebarProvider>
          
    //     </SidebarProvider>
    //   </UserProvider>
    // </React.StrictMode>
    <SidebarProvider>
      <React.StrictMode>
        <UserProvider>
        <Router>
            <Toaster position="top-right" />
            <Routes>



              {/* Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<AccessDenied />} />



              {/* Parent */}
              <Route
                path="/parent"
                element={
                  <RequireAuth role="parent">
                    <ParentLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<ParentDashboard />} />
                
              </Route>

              {/* Teacher */}
              <Route
                path="/teacher"
                element={
                  <RequireAuth role="teacher">
                    <TeacherLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<TeacherDashboard />} />
                <Route path="classrooms/:id" element={<TeacherClassroomAttendance/>}/>
                <Route path="profile" element={<TeacherProfile />} />
                <Route path="reports" element={<TeacherReportsHome />} />
                <Route path="reports/daily" element={<ReportDailyAttendance />} />
                <Route path="reports/student-summary" element={<ReportStudentSummary />} />
                <Route path="reports/classroom-analytics" element={<ReportClassroomAnalytics />} />
                <Route path="reports/student-profile/:studentId" element={<ReportStudentProfile />} />
                <Route path="reports/term" element={<ReportTerm />} />
                <Route path="reports/alerts" element={<ReportAlerts />} />
              </Route>


              {/* Admin (School) */}
              <Route
                path="/school"
                element={
                  <RequireAuth role="admin">
                    <SchoolLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<SchoolDashboard />} />
                <Route path="dashboard" element={<SchoolDashboard />} />
                <Route path="term" element={<SchoolTerm />} />
                <Route path="terms" element={<SchoolTerm />} />
                <Route path="classroom" element={<SchoolClassroom />} />
                <Route path="user" element={<SchoolUser />} />
                <Route path="department" element={<SchoolDepartment />} />
                <Route path="grade" element={<SchoolGrade />} />
                <Route path="student" element={<SchoolStudent />} />
                <Route path="student/:studentId" element={<SchoolStudentDetail />} />
                <Route path="student/:studentId/detail" element={<SchoolStudentDetail />} />
                <Route path="student/:studentId/enrollment" element={<SchoolStudentEnrollmentDetail />} />
                <Route path="enrollment" element={<SchoolEnrollment />} />
                <Route path="enrollment/:studentId" element={<SchoolStudentEnrollmentDetail />} />
                <Route path="parents" element={<SchoolParents />} />
                <Route path="settings" element={<SchoolGeneralSettings />} />
                <Route path="settings/general" element={<SchoolGeneralSettings />} />
                {/* Trash Pages */}
                <Route path="trash/user" element={<SchoolUserTrash />} />
                <Route path="trash/classroom" element={<SchoolClassroomTrash />} />
                <Route path="trash/department" element={<SchoolDepartmentTrash />} />
                <Route path="trash/grade" element={<SchoolGradeTrash />} />
                <Route path="trash/student" element={<SchoolStudentTrash />} />
                <Route path="trash/term" element={<SchoolTermTrash />} />
                <Route path="trash/terms" element={<SchoolTermTrash />} />
              </Route>



              {/* Super Admin */}
              <Route
                path="/"
                element={
                  <RequireAuth role="super_admin">
                    <Home />
                  </RequireAuth>
                }
              >
                <Route index element={<SchoolPage />} />
                <Route path="schools" element={<SchoolPage />} />
                <Route path="users" element={<UserPage />} />
                <Route path="view/school" element={<SchoolPage />} />
                <Route path="view/schools" element={<SchoolPage />} />
                <Route path="view/users" element={<UserPage />} />
                <Route path="view/user" element={<UserPage />} />
                <Route path="view/classroom" element={<UserPage />} />
                <Route path="view/dashboard" element={<SchoolPage />} />
                <Route path="creator/school" element={<CreateSchoolPage />} />
                <Route path="creator/schools" element={<CreateSchoolPage />} />
                <Route path="creator/user" element={<CreateUserPage />} />
                <Route path="creator/users" element={<CreateUserPage />} />
                <Route path="creator/classroom" element={<CreateClassPage />} />
              </Route>

              {/* Unauthorized fallback */}
              <Route path="*" element={<AccessDenied />} />

              {/* Optional: catch-all fallback */}
              {/* <Route path="*" element={<Navigate to="/unauthorized" />} /> */}

            </Routes>
          </Router>
        </UserProvider>
      </React.StrictMode>
    </SidebarProvider>
  );
}

export default App;
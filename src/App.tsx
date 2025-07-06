import {SidebarProvider} from "./components/ui/sidebar";
import "./App.css";
import {BrowserRouter as Router} from "react-router";
import {Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SchoolLayout from "./pages/SchoolLayout";
import ParentLayout from "./pages/ParentLayout";
import TeacherLayout from "./pages/TeacherLayout";
import SchoolDashboard from "./pages/school/ShoolDashboard";
import SchoolTerm from "./pages/school/SchoolTerm";
import SchoolClassroom from "./pages/school/SchoolClassroom";
import SchoolDepartment from "./pages/school/SchoolDepartment";
import SchoolGrade from "./pages/school/SchoolGrade";
import SchoolStudent from "./pages/school/SchoolStudent";
import SchoolUser from "./pages/school/SchoolUser";
import {UserProvider} from "./context/UserContext";
import React from "react";
import RequireAuth from "./components/RequireAuth";
import UserTable from "./pages/Users";
import { Toaster } from "sonner";

function App() {
    return (
        <SidebarProvider>
            <React.StrictMode>
                <UserProvider>
                    <Router>
                        <Toaster position="top-right" />
                        <Routes>
                            <Route path="/login"
                                element={<Login/>}/>
                            <Route path="/parent"
                                element={
                                    <RequireAuth
                                role="parent"><ParentLayout/></RequireAuth>
                            }></Route>
                            <Route path="/teacher"
                                element={
                                    <RequireAuth
                                role="teacher"><TeacherLayout/></RequireAuth>
                            }></Route>
                            <Route path="/school"
                                element={
                                    <RequireAuth
                                role="admin"><SchoolLayout/></RequireAuth>
                            }>

                                <Route path="/school/dashboard"
                                    element={<SchoolDashboard/>}/>
                                <Route path="/school/term"
                                    element={<SchoolTerm/>}/>
                                <Route path="/school/classroom"
                                    element={<SchoolClassroom/>}/>
                                <Route path="/school/user"
                                    element={<SchoolUser/>}/>
                                <Route path="/school/department"
                                    element={<SchoolDepartment/>}/>
                                <Route path="/school/grade"
                                    element={<SchoolGrade/>}/>
                                <Route path="/school/student"
                                    element={<SchoolStudent/>}/>

                            </Route>
                            <Route path="/"
                                element={
                                    <RequireAuth
                                role="super_admin"><Home/></RequireAuth>
                            }>
                              <Route path="/view/user" element={<UserTable/>} />
                              <Route path="/view/classroom" element={<UserTable/>} />
                              <Route path="/view/school" element={<UserTable/>} />
                              <Route path="/view/dashboard" element={<UserTable/>} />
                              <Route path="/creator/user" element={<UserTable/>} />
                              <Route path="/creator/classroom" element={<UserTable/>} />
                              <Route path="/creator/school" element={<UserTable/>} />
                            </Route>
                            <Route path="/unauthorized"
                                element={
                                    <h2>Access Denied</h2>
                                }/>
                        </Routes>
                    </Router>
                </UserProvider>
            </React.StrictMode>
        </SidebarProvider>
    );
}
export default App;

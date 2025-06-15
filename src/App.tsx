import { SidebarProvider } from "./components/ui/sidebar";
import "./App.css";
import {BrowserRouter as Router } from "react-router";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Schools from "./pages/Schools";
import Login from "./pages/Login";
import CreateSchool from "./components/CreateSchool";
import CreateUser from "./components/CreateUser";
import CreateClass from "./components/CreateClass";
import CreateDepartment from "./components/CreateDepartment";
import CreateTerm from "./components/CreateTerm";
import CreateGrade from "./components/CreateGrade";
function App() {
  return (
    <SidebarProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} >
            <Route path="/schools" element={<Schools />} />
            <Route path="/creator/department" element={<CreateDepartment />} />
            <Route path="/creator/school" element={<CreateSchool />} />
            <Route path="/creator/user" element={<CreateUser />} />
            <Route path="/creator/class" element={<CreateClass />} />
            <Route path="/creator/term" element={<CreateTerm />} />
            <Route path="/creator/grade" element={<CreateGrade />} />
          </Route>
        </Routes>
      </Router>
    </SidebarProvider>
  );
}
export default App;

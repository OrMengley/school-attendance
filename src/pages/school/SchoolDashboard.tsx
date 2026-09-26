import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../lib/axios";
import { useUser } from "../../context/UserContext";
import { getCurrentUser } from "../../utils/auth";
import type { SchoolType } from "../../types/SchoolType";
import type { StudentType } from "../../types/Student";
import type { ClassroomType } from "../../types/Classroom";
import type { UserType } from "../../types/User";
import type { TermType } from "../../types/Term";
import type { GradeType } from "../../types/Grade";
import type { DepartmentType } from "../../types/Department";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

import CreateStudentModal from "../../components/school/school-studentModal";
import SchoolUserCreateModal from "../../components/school/school-createUserModal";
import SchoolCreateClassroomModal from "../../components/school/school-classroomModal";

import {
  GraduationCap,
  Users,
  DoorOpen,
  Calendar,
  Layers,
  Plus,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  MapPin,
  Settings,
  Trash2,
  BookOpen,
  Phone,
  Sparkles,
  School,
  Activity,
  Award,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";

const GENDER_COLORS = {
  male: "#3b82f6", // Blue
  female: "#ec4899", // Pink
  other: "#94a3b8", // Slate
};

export default function SchoolDashboard() {
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();

  // Data states
  const [school, setSchool] = useState<SchoolType | null>(null);
  const [students, setStudents] = useState<StudentType[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [terms, setTerms] = useState<TermType[]>([]);
  const [grades, setGrades] = useState<GradeType[]>([]);
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [trashedTermsCount, setTrashedTermsCount] = useState<number>(0);

  // UI / Filter states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTermId, setSelectedTermId] = useState<string>("all");

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isClassroomModalOpen, setIsClassroomModalOpen] = useState(false);

  const schoolId = user?.school_id || getCurrentUser()?.school_id || "";

  const fetchAllDashboardData = async (isManualRefresh = false) => {
    if (!schoolId) {
      if (!userLoading) setLoading(false);
      return;
    }

    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [
        schoolRes,
        studentsRes,
        classroomsRes,
        usersRes,
        termsRes,
        gradesRes,
        departmentsRes,
        trashTermsRes,
      ] = await Promise.allSettled([
        API.get(`/schools/${schoolId}`),
        API.get(`/students/school/${schoolId}`),
        API.get(`/classrooms/school/${schoolId}`),
        API.get("/users"),
        API.get(`/terms?school_id=${schoolId}`),
        API.get("/grades"),
        API.get(`/departments/school/${schoolId}`),
        API.get(`/terms/trash?school_id=${schoolId}`),
      ]);

      if (schoolRes.status === "fulfilled" && schoolRes.value.data) {
        setSchool(schoolRes.value.data);
      }

      if (studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value.data)) {
        setStudents(studentsRes.value.data);
      }

      if (classroomsRes.status === "fulfilled" && Array.isArray(classroomsRes.value.data)) {
        setClassrooms(classroomsRes.value.data);
      }

      if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value.data)) {
        setUsers(usersRes.value.data);
      }

      if (termsRes.status === "fulfilled" && Array.isArray(termsRes.value.data)) {
        setTerms(termsRes.value.data);
      }

      if (gradesRes.status === "fulfilled" && Array.isArray(gradesRes.value.data)) {
        setGrades(gradesRes.value.data);
      }

      if (departmentsRes.status === "fulfilled" && Array.isArray(departmentsRes.value.data)) {
        setDepartments(departmentsRes.value.data);
      }

      if (trashTermsRes.status === "fulfilled" && Array.isArray(trashTermsRes.value.data)) {
        setTrashedTermsCount(trashTermsRes.value.data.length);
      }

      if (isManualRefresh) {
        toast.success("ទិន្នន័យត្រូវបានធ្វើបច្ចុប្បន្នភាព! (Dashboard refreshed)");
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      toast.error("បរាជ័យក្នុងការទាញយកទិន្នន័យ (Failed to load dashboard)");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!userLoading) {
      fetchAllDashboardData();
    }
  }, [schoolId, userLoading]);

  // Calculations & Analytics
  const teachers = useMemo(() => users.filter((u) => u.role === "teacher"), [users]);
  const parents = useMemo(() => users.filter((u) => u.role === "parent"), [users]);
  const staffAdmins = useMemo(() => users.filter((u) => u.role === "admin"), [users]);

  // Filtered students according to selected term
  const filteredStudents = useMemo(() => {
    if (selectedTermId === "all") return students;
    return students.filter((s) => {
      if (s.term_id === selectedTermId) return true;
      if (s.enrollments && s.enrollments.some((e) => e.term_id === selectedTermId)) return true;
      return false;
    });
  }, [students, selectedTermId]);

  // Filtered classrooms according to selected term
  const filteredClassrooms = useMemo(() => {
    if (selectedTermId === "all") return classrooms;
    return classrooms.filter((c) => c.term_id === selectedTermId);
  }, [classrooms, selectedTermId]);

  // Student Demographics (Gender)
  const genderStats = useMemo(() => {
    let maleCount = 0;
    let femaleCount = 0;
    let otherCount = 0;

    filteredStudents.forEach((s) => {
      const sex = (s.sex || "").toLowerCase();
      if (sex === "male" || sex === "ប្រុស" || sex === "m") {
        maleCount++;
      } else if (sex === "female" || sex === "ស្រី" || sex === "f") {
        femaleCount++;
      } else {
        otherCount++;
      }
    });

    const total = filteredStudents.length;
    const data = [
      {
        name: "ប្រុស (Male)",
        value: maleCount,
        color: GENDER_COLORS.male,
        percentage: total > 0 ? Math.round((maleCount / total) * 100) : 0,
      },
      {
        name: "ស្រី (Female)",
        value: femaleCount,
        color: GENDER_COLORS.female,
        percentage: total > 0 ? Math.round((femaleCount / total) * 100) : 0,
      },
    ];

    if (otherCount > 0) {
      data.push({
        name: "ផ្សេងៗ (Other)",
        value: otherCount,
        color: GENDER_COLORS.other,
        percentage: total > 0 ? Math.round((otherCount / total) * 100) : 0,
      });
    }

    return { data, maleCount, femaleCount, total };
  }, [filteredStudents]);

  // Classroom & Grade Distribution Chart Data
  const gradeDistributionData = useMemo(() => {
    // Map classrooms per grade name
    const countMap: Record<string, { gradeName: string; classrooms: number; students: number }> = {};

    filteredClassrooms.forEach((c) => {
      const gradeName = (c as any).grade?.name || "ទូទៅ (General)";
      if (!countMap[gradeName]) {
        countMap[gradeName] = { gradeName, classrooms: 0, students: 0 };
      }
      countMap[gradeName].classrooms += 1;
      const enrolledCount = Array.isArray(c.studentIds) ? c.studentIds.length : 0;
      countMap[gradeName].students += enrolledCount;
    });

    return Object.values(countMap);
  }, [filteredClassrooms]);

  // Total Sessions across all classrooms
  const totalSessionsCount = useMemo(() => {
    return filteredClassrooms.reduce((acc, c) => {
      return acc + (Array.isArray(c.sessions) ? c.sessions.length : 0);
    }, 0);
  }, [filteredClassrooms]);

  // Recent 5 registered students
  const recentStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())
      .slice(0, 5);
  }, [students]);

  // Active Term Name
  const activeTerm = useMemo(() => {
    if (selectedTermId !== "all") {
      return terms.find((t) => t._id === selectedTermId);
    }
    return terms[0];
  }, [terms, selectedTermId]);

  if (loading || userLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-36" />
          </div>
        </div>

        {/* 4 Stat Cards Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>

        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>

        {/* Tables Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* 1. Top Executive Welcome & School Brand Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-card to-card border rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl border bg-background flex items-center justify-center overflow-hidden shadow-xs shrink-0">
            {school?.logo_url ? (
              <img
                src={school.logo_url}
                alt={school.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <School className="h-7 w-7 text-primary" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {school?.name || "ផ្ទាំងគ្រប់គ្រងសាលារៀន (School Dashboard)"}
              </h1>
              <Badge variant={school?.is_active !== false ? "default" : "secondary"} className="text-xs">
                {school?.is_active !== false ? "ដំណើរការ (Active)" : "អសកម្ម (Inactive)"}
              </Badge>
              {trashedTermsCount > 0 && (
                <Badge
                  variant="outline"
                  className="cursor-pointer text-amber-600 border-amber-300 hover:bg-amber-50 dark:text-amber-400 gap-1"
                  onClick={() => navigate("/school/trash/term")}
                >
                  <Trash2 className="h-3 w-3" />
                  ធុងសំរាម ({trashedTermsCount})
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
              {school?.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {school.address}
                </span>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date().toLocaleDateString("km-KH", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions & Term Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Term Filter */}
          {terms.length > 0 && (
            <div className="w-44">
              <Select value={selectedTermId} onValueChange={setSelectedTermId}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="ជ្រើសរើសឆមាស (Term)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ឆមាសទាំងអស់ (All Terms)</SelectItem>
                  {terms.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      ឆមាស {t.year || t._id.slice(-4)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAllDashboardData(true)}
            disabled={refreshing}
            className="h-9 gap-1.5"
            title="ធ្វើបច្ចុប្បន្នភាពទិន្នន័យ"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-primary" : ""}`} />
            <span className="hidden sm:inline">ផ្ទុកឡើងវិញ</span>
          </Button>

          {/* Quick Create Dropdown / Modals */}
          <Button
            size="sm"
            onClick={() => setIsStudentModalOpen(true)}
            className="h-9 gap-1.5 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span>បន្ថែមសិស្ស</span>
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Students */}
        <Card
          className="border shadow-xs hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
          onClick={() => navigate("/school/student")}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:scale-110 transition-transform" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              សិស្សសរុប (Total Students)
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              {filteredStudents.length.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
              <span className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded">
                ប្រុស: {genderStats.maleCount}
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50 px-1.5 py-0.5 rounded">
                ស្រី: {genderStats.femaleCount}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Teachers & Staff */}
        <Card
          className="border shadow-xs hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
          onClick={() => navigate("/school/user")}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:scale-110 transition-transform" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              គ្រូបង្រៀន & បុគ្គលិក (Teachers & Staff)
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              {teachers.length.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span className="text-muted-foreground font-medium">
                Admin: {staffAdmins.length} | អាណាព្យាបាល: {parents.length}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Classrooms & Sessions */}
        <Card
          className="border shadow-xs hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
          onClick={() => navigate("/school/classroom")}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:scale-110 transition-transform" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ថ្នាក់រៀនសរុប (Classrooms)
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <DoorOpen className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              {filteredClassrooms.length.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-amber-600" />
              <span>កាលវិភាគ/ម៉ោងបង្រៀន: {totalSessionsCount} ម៉ោង</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Academic Structure (Departments & Grades) */}
        <Card
          className="border shadow-xs hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
          onClick={() => navigate("/school/department")}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:scale-110 transition-transform" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ដេប៉ាតឺម៉ង់ & កម្រិតថ្នាក់ (Structure)
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              {departments.length.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <Award className="h-3.5 w-3.5 text-emerald-600" />
              <span>កម្រិតថ្នាក់ (Grades): {grades.length} | ឆមាស: {terms.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Classrooms per Grade Chart */}
        <Card className="lg:col-span-2 border shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  ការបែងចែកថ្នាក់រៀនតាមកម្រិត (Classrooms by Grade)
                </CardTitle>
                <CardDescription className="text-xs">
                  ចំនួនថ្នាក់រៀនដែលបានបង្កើតតាមកម្រិតថ្នាក់នីមួយៗ
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {filteredClassrooms.length} ថ្នាក់រៀន
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {gradeDistributionData.length > 0 ? (
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis
                      dataKey="gradeName"
                      tickLine={false}
                      axisLine={false}
                      className="text-[11px] fill-muted-foreground"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      className="text-[11px] fill-muted-foreground"
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-popover border text-popover-foreground rounded-lg shadow-md p-2.5 text-xs">
                              <p className="font-bold mb-1">{label}</p>
                              <p className="text-primary">
                                ចំនួនថ្នាក់: <strong>{payload[0].value}</strong> ថ្នាក់
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="classrooms" fill="var(--primary, #3b82f6)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[260px] flex flex-col items-center justify-center text-muted-foreground text-center">
                <DoorOpen className="h-10 w-10 mb-2 stroke-1 opacity-50" />
                <p className="text-sm font-medium">មិនទាន់មានទិន្នន័យថ្នាក់រៀននៅឡើយទេ</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setIsClassroomModalOpen(true)}
                  className="mt-1 text-xs"
                >
                  + បង្កើតថ្នាក់រៀនដំបូង
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Gender Demographics Donut Chart */}
        <Card className="border shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              សមាមាត្រយេនឌ័រសិស្ស (Gender Ratio)
            </CardTitle>
            <CardDescription className="text-xs">
              សមាមាត្រសិស្សប្រុស និងសិស្សស្រីនៅក្នុងសាលា
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {filteredStudents.length > 0 ? (
              <div className="flex flex-col items-center justify-center">
                <div className="h-[180px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderStats.data}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {genderStats.data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-popover border text-popover-foreground rounded-lg shadow-md p-2 text-xs">
                                <span className="font-semibold">{data.name}</span>:{" "}
                                <strong>{data.value} នាក់</strong> ({data.percentage}%)
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-foreground">{genderStats.total}</span>
                    <span className="text-[10px] text-muted-foreground">សិស្សសរុប</span>
                  </div>
                </div>

                {/* Custom Legend */}
                <div className="grid grid-cols-2 gap-3 w-full mt-2 pt-3 border-t">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                    <div className="text-xs">
                      <p className="font-semibold text-foreground">ប្រុស: {genderStats.maleCount}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {genderStats.data.find((d) => d.name.includes("Male"))?.percentage || 0}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-pink-500/5 border border-pink-500/10">
                    <div className="w-3 h-3 rounded-full bg-pink-500 shrink-0" />
                    <div className="text-xs">
                      <p className="font-semibold text-foreground">ស្រី: {genderStats.femaleCount}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {genderStats.data.find((d) => d.name.includes("Female"))?.percentage || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground text-center">
                <Users className="h-10 w-10 mb-2 stroke-1 opacity-50" />
                <p className="text-sm font-medium">មិនទាន់មានទិន្នន័យសិស្សនៅឡើយទេ</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setIsStudentModalOpen(true)}
                  className="mt-1 text-xs"
                >
                  + ចុះឈ្មោះសិស្សដំបូង
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. Quick Actions Hub + Recent Students & Classrooms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Students Table */}
        <Card className="lg:col-span-2 border shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                សិស្សដែលបានចុះឈ្មោះថ្មីៗ (Recent Students)
              </CardTitle>
              <CardDescription className="text-xs">
                បញ្ជីសិស្សដែលបានចុះឈ្មោះចូលរៀនចុងក្រោយបង្អស់
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/school/student")}
              className="text-xs gap-1 text-primary hover:text-primary"
            >
              <span>មើលទាំងអស់</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs">សិស្ស (Student)</TableHead>
                      <TableHead className="text-xs">ភេទ (Sex)</TableHead>
                      <TableHead className="text-xs">ថ្នាក់រៀន (Classroom)</TableHead>
                      <TableHead className="text-xs">លេខទូរស័ព្ទអាណាព្យាបាល</TableHead>
                      <TableHead className="text-xs">ស្ថានភាព</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentStudents.map((s) => {
                      const rawSex = ((s.sex as string) || "").toLowerCase();
                      const sexKhmer =
                        rawSex === "male" || rawSex === "ប្រុស" || rawSex === "m"
                          ? "ប្រុស"
                          : rawSex === "female" || rawSex === "ស្រី" || rawSex === "f"
                          ? "ស្រី"
                          : "-";
                      const isMale = sexKhmer === "ប្រុស";

                      return (
                        <TableRow key={s._id} className="hover:bg-muted/30">
                          <TableCell className="py-2.5">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-8 w-8 rounded-full border">
                                <AvatarImage src={s.profileUrl} alt={s.name} />
                                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                  {s.name ? s.name.charAt(0).toUpperCase() : "S"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-xs text-foreground leading-none">
                                  {s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim() || "មិនស្គាល់ឈ្មោះ"}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                                  {s.id_number || s._id.slice(-6)}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 text-xs">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                isMale
                                  ? "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30"
                                  : "text-pink-600 border-pink-200 bg-pink-50 dark:bg-pink-950/30"
                              }`}
                            >
                              {sexKhmer}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5 text-xs">
                            <span className="font-medium text-foreground">
                              {s.classroom?.name || "មិនទាន់ចាត់ថ្នាក់"}
                            </span>
                          </TableCell>
                          <TableCell className="py-2.5 text-xs font-mono">
                            {s.parentPhone ? (
                              <a
                                href={`tel:${s.parentPhone}`}
                                className="inline-flex items-center gap-1 text-primary hover:underline"
                              >
                                <Phone className="h-3 w-3" />
                                {s.parentPhone}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2.5 text-xs">
                            <Badge
                              variant={s.status === "inactive" ? "secondary" : "default"}
                              className="text-[10px]"
                            >
                              {s.status === "inactive" ? "អសកម្ម" : "សកម្ម"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground text-xs">
                មិនទាន់មានសិស្សចុះឈ្មោះនៅឡើយទេ
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Quick Navigation Hub & Shortcuts */}
        <div className="space-y-6">
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                ផ្លូវកាត់គ្រប់គ្រង (Quick Access)
              </CardTitle>
              <CardDescription className="text-xs">
                ចូលទៅកាន់មុខងារសំខាន់ៗរបស់សាលារៀន
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Button
                variant="outline"
                className="w-full justify-between h-11 text-xs hover:bg-primary/5 hover:border-primary/40 transition-colors"
                onClick={() => setIsStudentModalOpen(true)}
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-500" />
                  ចុះឈ្មោះសិស្សថ្មី (Add Student)
                </span>
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between h-11 text-xs hover:bg-primary/5 hover:border-primary/40 transition-colors"
                onClick={() => setIsUserModalOpen(true)}
              >
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-500" />
                  បង្កើតគណនីគ្រូ/បុគ្គលិក (Add Teacher)
                </span>
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between h-11 text-xs hover:bg-primary/5 hover:border-primary/40 transition-colors"
                onClick={() => setIsClassroomModalOpen(true)}
              >
                <span className="flex items-center gap-2">
                  <DoorOpen className="h-4 w-4 text-amber-500" />
                  បង្កើតថ្នាក់រៀនថ្មី (Add Classroom)
                </span>
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between h-11 text-xs hover:bg-primary/5 hover:border-primary/40 transition-colors"
                onClick={() => navigate("/school/enrollment")}
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-emerald-500" />
                  ការចុះឈ្មោះចូលរៀន (Student Enrollment)
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between h-11 text-xs hover:bg-primary/5 hover:border-primary/40 transition-colors"
                onClick={() => navigate("/school/term")}
              >
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  គ្រប់គ្រងឆមាសសិក្សា (Terms)
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between h-11 text-xs hover:bg-primary/5 hover:border-primary/40 transition-colors"
                onClick={() => navigate("/school/settings/general")}
              >
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  ព័ត៌មានទូទៅ & រូបសញ្ញា (Settings)
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between h-11 text-xs text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 border-dashed transition-colors"
                onClick={() => navigate("/school/trash/term")}
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-amber-600" />
                  ធុងសំរាម & ស្ដារទិន្នន័យ (Trash & Restore)
                </span>
                {trashedTermsCount > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {trashedTermsCount}
                  </Badge>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 5. Modals for Quick Creation Directly from Dashboard */}
      {isStudentModalOpen && (
        <CreateStudentModal
          isOpen={isStudentModalOpen}
          onClose={() => setIsStudentModalOpen(false)}
          onSuccess={() => {
            setIsStudentModalOpen(false);
            fetchAllDashboardData();
          }}
        />
      )}

      {isUserModalOpen && (
        <SchoolUserCreateModal
          open={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          onCreated={() => {
            setIsUserModalOpen(false);
            fetchAllDashboardData();
          }}
        />
      )}

      {isClassroomModalOpen && (
        <SchoolCreateClassroomModal
          isOpen={isClassroomModalOpen}
          onClose={() => setIsClassroomModalOpen(false)}
          onSuccess={() => {
            setIsClassroomModalOpen(false);
            fetchAllDashboardData();
          }}
        />
      )}
    </div>
  );
}

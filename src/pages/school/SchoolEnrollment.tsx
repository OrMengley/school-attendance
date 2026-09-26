import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../../lib/axios";
import { useUser } from "../../context/UserContext";
import type { StudentType } from "../../types/Student";
import type { TermType } from "../../types/Term";
import type { ClassroomType } from "../../types/Classroom";
import type { GradeType } from "../../types/Grade";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

import {
  GraduationCap,
  Calendar,
  DoorOpen,
  Layers,
  Search,
  CheckCircle2,
  RefreshCw,
  UserCheck,
  UserX,
  History,
  BookOpenCheck,
  Sparkles,
  Users,
  Filter,
  ArrowRight,
  Loader2,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function SchoolEnrollment() {
  const { user, loading: userLoading } = useUser();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Core data
  const [students, setStudents] = useState<StudentType[]>([]);
  const [terms, setTerms] = useState<TermType[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomType[]>([]);
  const [grades, setGrades] = useState<GradeType[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTermFilter, setSelectedTermFilter] = useState<string>("all");
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>("all");
  const [selectedClassroomFilter, setSelectedClassroomFilter] = useState<string>("all");
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState<"all" | "enrolled" | "unassigned">("all");

  // Batch Enrollment Tab States
  const [batchTermId, setBatchTermId] = useState<string>("");
  const [batchGradeId, setBatchGradeId] = useState<string>("");
  const [batchClassroomId, setBatchClassroomId] = useState<string>("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isBatchSubmitting, setIsBatchSubmitting] = useState(false);

  const schoolId = user?.school_id || "";

  const fetchData = async (isManual = false) => {
    if (!schoolId) {
      if (!userLoading) setLoading(false);
      return;
    }

    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [studentsRes, termsRes, classroomsRes, gradesRes] = await Promise.allSettled([
        API.get(`/students/school/${schoolId}`),
        API.get(`/terms?school_id=${schoolId}`),
        API.get(`/classrooms/school/${schoolId}`),
        API.get("/grades"),
      ]);

      let loadedStudents: StudentType[] = [];
      if (studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value.data)) {
        loadedStudents = studentsRes.value.data;
        setStudents(loadedStudents);
      }

      if (termsRes.status === "fulfilled" && Array.isArray(termsRes.value.data)) {
        setTerms(termsRes.value.data);
      }

      if (classroomsRes.status === "fulfilled" && Array.isArray(classroomsRes.value.data)) {
        setClassrooms(classroomsRes.value.data);
      }

      if (gradesRes.status === "fulfilled" && Array.isArray(gradesRes.value.data)) {
        setGrades(gradesRes.value.data);
      }

      // If student_id is provided in search params, navigate to dedicated page
      const paramStudentId = searchParams.get("student_id");
      if (paramStudentId) {
        navigate(`/school/student/${paramStudentId}/enrollment`, { replace: true });
        return;
      }

      if (isManual) {
        toast.success("ទិន្នន័យត្រូវបានធ្វើបច្ចុប្បន្នភាព! (Data refreshed)");
      }
    } catch (err) {
      console.error("Failed to load enrollment data:", err);
      toast.error("បរាជ័យក្នុងការទាញយកទិន្នន័យចុះឈ្មោះ");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!userLoading) {
      fetchData();
    }
  }, [schoolId, userLoading]);

  // Lookup maps
  const termMap = useMemo(() => {
    const map = new Map<string, TermType>();
    terms.forEach((t) => map.set(t._id, t));
    return map;
  }, [terms]);

  const classroomMap = useMemo(() => {
    const map = new Map<string, ClassroomType>();
    classrooms.forEach((c) => map.set(c._id, c));
    return map;
  }, [classrooms]);

  // Filtered Classrooms for Batch Tab
  const batchAvailableClassrooms = useMemo(() => {
    let list = classrooms;
    if (batchGradeId && batchGradeId !== "all") {
      list = list.filter((c) => c.grade_id === batchGradeId);
    }
    if (batchTermId && batchTermId !== "all") {
      list = list.filter((c) => c.term_id === batchTermId || !c.term_id);
    }
    return list;
  }, [classrooms, batchGradeId, batchTermId]);

  // Metrics
  const enrolledStudents = useMemo(() => {
    return students.filter((s) => Boolean(s.classroom_id || (s.enrollments && s.enrollments.length > 0)));
  }, [students]);

  const unassignedStudents = useMemo(() => {
    return students.filter((s) => !s.classroom_id && (!s.enrollments || s.enrollments.length === 0));
  }, [students]);

  // Filtered student list for table
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = (s.name || "").toLowerCase().includes(query);
        const matchId = (s.id_number || s._id).toLowerCase().includes(query);
        const matchPhone = (s.parentPhone || "").includes(query);
        const matchClass = ((s.classroom?.name || "")).toLowerCase().includes(query);
        if (!matchName && !matchId && !matchPhone && !matchClass) return false;
      }

      // Term filter
      if (selectedTermFilter !== "all") {
        const matchesTerm =
          s.term_id === selectedTermFilter ||
          (s.enrollments && s.enrollments.some((e) => e.term_id === selectedTermFilter));
        if (!matchesTerm) return false;
      }

      // Grade filter
      if (selectedGradeFilter !== "all") {
        const currentClass = classroomMap.get(s.classroom_id || "");
        if (currentClass?.grade_id !== selectedGradeFilter) return false;
      }

      // Classroom filter
      if (selectedClassroomFilter !== "all") {
        if (s.classroom_id !== selectedClassroomFilter) return false;
      }

      // Status filter
      if (enrollmentStatusFilter === "enrolled") {
        if (!s.classroom_id && (!s.enrollments || s.enrollments.length === 0)) return false;
      } else if (enrollmentStatusFilter === "unassigned") {
        if (s.classroom_id || (s.enrollments && s.enrollments.length > 0)) return false;
      }

      return true;
    });
  }, [
    students,
    searchQuery,
    selectedTermFilter,
    selectedGradeFilter,
    selectedClassroomFilter,
    enrollmentStatusFilter,
    classroomMap,
  ]);

  // Toggle student selection for batch enrollment
  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllUnassigned = () => {
    const unassignedIds = unassignedStudents.map((s) => s._id);
    setSelectedStudentIds(unassignedIds);
  };

  const handleClearSelection = () => {
    setSelectedStudentIds([]);
  };

  // Batch Enrollment Submit
  const handleBatchEnrollmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchTermId || !batchClassroomId || selectedStudentIds.length === 0) {
      toast.error("សូមជ្រើសរើសឆមាស ថ្នាក់រៀន និងជ្រើសរើសសិស្សយ៉ាងហោចណាស់ម្នាក់");
      return;
    }

    setIsBatchSubmitting(true);
    try {
      // Use assign students API
      await API.put("/classrooms/assign-students", {
        studentIds: selectedStudentIds,
        classroom_id: batchClassroomId,
        term_id: batchTermId,
      }).catch(async () => {
        // Fallback: update students individually if bulk route structure differs
        await Promise.all(
          selectedStudentIds.map((sId) =>
            API.put(`/students/${sId}/classroom`, {
              classroom_id: batchClassroomId,
              term_id: batchTermId,
            })
          )
        );
      });

      toast.success(
        `បានចុះឈ្មោះសិស្សចំនួន ${selectedStudentIds.length} នាក់ចូលថ្នាក់រៀនដោយជោគជ័យ!`
      );
      setSelectedStudentIds([]);
      fetchData();
    } catch (err: any) {
      console.error("Batch enrollment error:", err);
      toast.error(err?.response?.data?.error || "បរាជ័យក្នុងការចុះឈ្មោះសិស្សជាក្រុម");
    } finally {
      setIsBatchSubmitting(false);
    }
  };

  if (loading || userLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <BookOpenCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                ការចុះឈ្មោះចូលរៀន
                <span className="text-base font-normal text-muted-foreground">
                  (Student Enrollment)
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                គ្រប់គ្រងការចុះឈ្មោះសិស្សចូលថ្នាក់រៀន តាមដានប្រវត្តិឆមាសសិក្សា និងចាត់ថ្នាក់ជាក្រុម
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="h-9 gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-primary" : ""}`} />
            <span>ផ្ទុកឡើងវិញ</span>
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              សិស្សសរុប (Total Students)
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight text-foreground">
              {students.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">សិស្សទាំងអស់នៅក្នុងសាលា</p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              បានចុះឈ្មោះចូលថ្នាក់ (Enrolled)
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              {enrolledStudents.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {students.length > 0
                ? `${Math.round((enrolledStudents.length / students.length) * 100)}% នៃសិស្សសរុប`
                : "0%"}
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              មិនទាន់មានថ្នាក់ (Unassigned)
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <UserX className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">
              {unassignedStudents.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">សិស្សរង់ចាំការចាត់ថ្នាក់</p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              ឆមាស & បន្ទប់រៀន (Terms & Classes)
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight text-foreground">
              {terms.length} ឆមាស
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {classrooms.length} បន្ទប់រៀនសកម្ម
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Content Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl">
          <TabsTrigger value="list" className="rounded-lg text-xs gap-1.5 py-1.5">
            <BookOpenCheck className="h-4 w-4" />
            <span>បញ្ជីសិស្ស & ការចុះឈ្មោះ (Enrollment List)</span>
          </TabsTrigger>
          <TabsTrigger value="batch" className="rounded-lg text-xs gap-1.5 py-1.5">
            <Users className="h-4 w-4" />
            <span>ចុះឈ្មោះជាក្រុម (Batch Enrollment)</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Student Enrollment Table */}
        <TabsContent value="list" className="space-y-4">
          <Card className="border shadow-xs">
            {/* Filter Bar */}
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ស្វែងរកតាមឈ្មោះ, អត្តលេខ, ទូរស័ព្ទ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs bg-background"
                  />
                </div>

                {/* Dropdown Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Filter */}
                  <Select
                    value={enrollmentStatusFilter}
                    onValueChange={(val: any) => setEnrollmentStatusFilter(val)}
                  >
                    <SelectTrigger className="h-9 text-xs w-[140px] bg-background">
                      <SelectValue placeholder="ស្ថានភាពចុះឈ្មោះ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ស្ថានភាពទាំងអស់</SelectItem>
                      <SelectItem value="enrolled">បានចុះឈ្មោះ (Enrolled)</SelectItem>
                      <SelectItem value="unassigned">មិនទាន់ចាត់ថ្នាក់</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Term Filter */}
                  <Select value={selectedTermFilter} onValueChange={setSelectedTermFilter}>
                    <SelectTrigger className="h-9 text-xs w-[150px] bg-background">
                      <SelectValue placeholder="ឆមាសទាំងអស់" />
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

                  {/* Grade Filter */}
                  <Select value={selectedGradeFilter} onValueChange={setSelectedGradeFilter}>
                    <SelectTrigger className="h-9 text-xs w-[140px] bg-background">
                      <SelectValue placeholder="កម្រិតទាំងអស់" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">កម្រិតទាំងអស់</SelectItem>
                      {grades.map((g) => (
                        <SelectItem key={g._id} value={g._id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Classroom Filter */}
                  <Select value={selectedClassroomFilter} onValueChange={setSelectedClassroomFilter}>
                    <SelectTrigger className="h-9 text-xs w-[140px] bg-background">
                      <SelectValue placeholder="ថ្នាក់ទាំងអស់" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ថ្នាក់ទាំងអស់</SelectItem>
                      {classrooms.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs">សិស្ស (Student)</TableHead>
                      <TableHead className="text-xs">ភេទ</TableHead>
                      <TableHead className="text-xs">ឆមាសបច្ចុប្បន្ន (Current Term)</TableHead>
                      <TableHead className="text-xs">ថ្នាក់រៀន (Classroom)</TableHead>
                      <TableHead className="text-xs">កម្រិតថ្នាក់</TableHead>
                      <TableHead className="text-xs">ប្រវត្តិ (History)</TableHead>
                      <TableHead className="text-xs text-right">សកម្មភាព (Actions)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((s) => {
                        const currentClass = classroomMap.get(s.classroom_id || "") || s.classroom;
                        const currentT = termMap.get(s.term_id || "") || s.term;
                        const enrollmentCount = (s.enrollments?.length || 0) + (s.classroom_id && s.term_id ? 1 : 0);
                        const isEnrolled = Boolean(s.classroom_id && s.term_id);

                        return (
                          <TableRow key={s._id} className="hover:bg-muted/30">
                            {/* Student Name & Avatar */}
                            <TableCell className="py-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 rounded-full border shadow-xs">
                                  <AvatarImage src={s.profileUrl} alt={s.name} />
                                  <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                    {s.name ? s.name.charAt(0).toUpperCase() : "S"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-xs text-foreground leading-none">
                                    {s.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                                    ID: {s.id_number || s._id.slice(-6)}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Sex */}
                            <TableCell className="py-3 text-xs">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  s.sex === "female"
                                    ? "text-pink-600 border-pink-200 bg-pink-50 dark:bg-pink-950/30"
                                    : "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30"
                                }`}
                              >
                                {s.sex === "female" ? "ស្រី" : "ប្រុស"}
                              </Badge>
                            </TableCell>

                            {/* Current Term */}
                            <TableCell className="py-3 text-xs">
                              {currentT ? (
                                <span className="font-medium text-foreground flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                  ឆមាស {currentT.year || currentT._id.slice(-4)}
                                </span>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] text-muted-foreground">
                                  មិនទាន់ចាត់ឆមាស
                                </Badge>
                              )}
                            </TableCell>

                            {/* Classroom */}
                            <TableCell className="py-3 text-xs">
                              {currentClass ? (
                                <span className="font-semibold text-foreground flex items-center gap-1">
                                  <DoorOpen className="h-3.5 w-3.5 text-primary" />
                                  {currentClass.name}
                                </span>
                              ) : (
                                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                                  មិនទាន់ចាត់ថ្នាក់
                                </Badge>
                              )}
                            </TableCell>

                            {/* Grade */}
                            <TableCell className="py-3 text-xs">
                              <span className="text-muted-foreground">
                                {(currentClass as any)?.grade?.name || "-"}
                              </span>
                            </TableCell>

                            {/* History Badge */}
                            <TableCell className="py-3 text-xs">
                              <Badge variant="secondary" className="text-[10px] gap-1 font-mono">
                                <History className="h-3 w-3" />
                                {enrollmentCount > 0 ? `${enrollmentCount} ឆមាស` : "គ្មាន"}
                              </Badge>
                            </TableCell>

                            {/* Action Buttons */}
                            <TableCell className="py-3 text-xs text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/school/student/${s._id}/enrollment`)}
                                className="h-8 gap-1.5 text-xs text-primary border-primary/20 hover:bg-primary/10 transition-colors"
                              >
                                <BookOpenCheck className="h-3.5 w-3.5" />
                                <span>មើលការចុះឈ្មោះ (View)</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="py-12 text-center text-xs text-muted-foreground">
                          រកមិនឃើញទិន្នន័យសិស្សត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Batch Enrollment */}
        <TabsContent value="batch" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Setup Batch Target Form */}
            <Card className="border shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  ជ្រើសរើសទិសដៅចុះឈ្មោះ (Target Classroom)
                </CardTitle>
                <CardDescription className="text-xs">
                  ជ្រើសរើសឆមាស និងបន្ទប់រៀនដែលត្រូវបញ្ចូលសិស្សជាក្រុម
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Target Term */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    ឆមាសសិក្សា (Target Term) *
                  </label>
                  <Select value={batchTermId} onValueChange={setBatchTermId}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="ជ្រើសរើសឆមាស" />
                    </SelectTrigger>
                    <SelectContent>
                      {terms.map((t) => (
                        <SelectItem key={t._id} value={t._id}>
                          ឆមាស {t.year || t._id.slice(-4)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Grade Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    កម្រិតថ្នាក់ (Grade Filter)
                  </label>
                  <Select value={batchGradeId} onValueChange={setBatchGradeId}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="កម្រិតទាំងអស់" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">កម្រិតទាំងអស់</SelectItem>
                      {grades.map((g) => (
                        <SelectItem key={g._id} value={g._id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Classroom */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <DoorOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    បន្ទប់រៀនគោលដៅ (Target Classroom) *
                  </label>
                  <Select value={batchClassroomId} onValueChange={setBatchClassroomId}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="ជ្រើសរើសបន្ទប់រៀន" />
                    </SelectTrigger>
                    <SelectContent>
                      {batchAvailableClassrooms.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name} {c.grade_id ? `(${(c as any).grade?.name || "Grade"})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>សិស្សដែលបានជ្រើសរើស:</span>
                    <strong className="text-primary font-bold text-sm">
                      {selectedStudentIds.length} នាក់
                    </strong>
                  </div>

                  <Button
                    type="button"
                    onClick={handleBatchEnrollmentSubmit}
                    disabled={
                      isBatchSubmitting ||
                      !batchTermId ||
                      !batchClassroomId ||
                      selectedStudentIds.length === 0
                    }
                    className="w-full gap-2 text-xs h-10 font-bold"
                  >
                    {isBatchSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        កំពុងចុះឈ្មោះ...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        បញ្ជាក់ការចុះឈ្មោះ ({selectedStudentIds.length})
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Right: Student Picker List */}
            <Card className="lg:col-span-2 border shadow-xs">
              <CardHeader className="pb-3 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      ជ្រើសរើសសិស្សដើម្បីចុះឈ្មោះ (Select Students)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      ធីកជ្រើសរើសសិស្សដែលចង់បញ្ចូលទៅក្នុងថ្នាក់រៀន
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllUnassigned}
                      className="text-xs h-8"
                    >
                      ជ្រើសរើសអ្នកគ្មានថ្នាក់ទាំងអស់ ({unassignedStudents.length})
                    </Button>
                    {selectedStudentIds.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearSelection}
                        className="text-xs h-8 text-destructive hover:text-destructive"
                      >
                        សម្អាតជម្រើស
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[480px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 sticky top-0 bg-background z-10">
                        <TableHead className="w-12 text-center"></TableHead>
                        <TableHead className="text-xs">សិស្ស (Student)</TableHead>
                        <TableHead className="text-xs">ភេទ</TableHead>
                        <TableHead className="text-xs">ថ្នាក់បច្ចុប្បន្ន</TableHead>
                        <TableHead className="text-xs">ស្ថានភាព</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((s) => {
                        const isSelected = selectedStudentIds.includes(s._id);
                        const currentClass = classroomMap.get(s.classroom_id || "") || s.classroom;

                        return (
                          <TableRow
                            key={s._id}
                            onClick={() => toggleStudentSelection(s._id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? "bg-primary/10" : "hover:bg-muted/30"
                            }`}
                          >
                            <TableCell className="py-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}} // handled by row click
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                            </TableCell>
                            <TableCell className="py-2.5">
                              <div className="flex items-center gap-2.5">
                                <Avatar className="h-8 w-8 rounded-full border">
                                  <AvatarImage src={s.profileUrl} alt={s.name} />
                                  <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                    {s.name ? s.name.charAt(0).toUpperCase() : "S"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-xs text-foreground">{s.name}</p>
                                  <p className="text-[10px] text-muted-foreground font-mono">
                                    ID: {s.id_number || s._id.slice(-6)}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-2.5 text-xs">
                              {s.sex === "female" ? "ស្រី" : "ប្រុស"}
                            </TableCell>
                            <TableCell className="py-2.5 text-xs">
                              {currentClass ? (
                                <span className="font-medium text-foreground">{currentClass.name}</span>
                              ) : (
                                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                                  មិនទាន់មានថ្នាក់
                                </Badge>
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

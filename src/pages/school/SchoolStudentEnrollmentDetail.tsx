import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import API from "../../lib/axios";
import { useUser } from "../../context/UserContext";
import type { StudentType } from "../../types/Student";
import type { TermType } from "../../types/Term";
import type { ClassroomType } from "../../types/Classroom";
import type { GradeType } from "../../types/Grade";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

import {
  ArrowLeft,
  GraduationCap,
  Calendar,
  DoorOpen,
  Plus,
  History,
  CheckCircle2,
  Loader2,
  Phone,
  Layers,
  Sparkles,
  MapPin,
  RefreshCw,
  Clock,
  BookOpenCheck,
  UserCheck,
  AlertCircle,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

export default function SchoolStudentEnrollmentDetail() {
  const { studentId: routeStudentId } = useParams<{ studentId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();

  const targetStudentId = routeStudentId || searchParams.get("student_id") || "";

  // Data states
  const [student, setStudent] = useState<StudentType | null>(null);
  const [terms, setTerms] = useState<TermType[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomType[]>([]);
  const [grades, setGrades] = useState<GradeType[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form states for enrollment
  const [selectedTermId, setSelectedTermId] = useState<string>("");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schoolId = user?.school_id || "";

  const fetchEnrollmentDetail = async (isManual = false) => {
    if (!targetStudentId || !schoolId) {
      if (!userLoading) setLoading(false);
      return;
    }

    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [singleStudentRes, studentsRes, termsRes, classroomsRes, gradesRes] = await Promise.allSettled([
        API.get(`/student/${targetStudentId}`),
        API.get(`/students/school/${schoolId}`),
        API.get(`/terms?school_id=${schoolId}`),
        API.get(`/classrooms/school/${schoolId}`),
        API.get("/grades"),
      ]);

      if (termsRes.status === "fulfilled" && Array.isArray(termsRes.value.data)) {
        setTerms(termsRes.value.data);
      }
      if (classroomsRes.status === "fulfilled" && Array.isArray(classroomsRes.value.data)) {
        setClassrooms(classroomsRes.value.data);
      }
      if (gradesRes.status === "fulfilled" && Array.isArray(gradesRes.value.data)) {
        setGrades(gradesRes.value.data);
      }

      let loadedStudent: StudentType | null = null;

      if (singleStudentRes.status === "fulfilled" && singleStudentRes.value.data && singleStudentRes.value.data._id) {
        loadedStudent = singleStudentRes.value.data;
      } else if (studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value.data)) {
        const found = studentsRes.value.data.find((s: StudentType) => s._id === targetStudentId);
        if (found) {
          loadedStudent = found;
        }
      }

      if (loadedStudent) {
        setStudent(loadedStudent);
        setSelectedTermId(loadedStudent.term_id || "");
        setSelectedClassroomId(loadedStudent.classroom_id || "");
      }

      if (isManual) {
        toast.success("ទិន្នន័យត្រូវបានធ្វើបច្ចុប្បន្នភាព! (Data refreshed)");
      }
    } catch (err) {
      console.error("Failed to load student enrollment details:", err);
      toast.error("បរាជ័យក្នុងការទាញយកព័ត៌មានចុះឈ្មោះសិស្ស");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!userLoading) {
      fetchEnrollmentDetail();
    }
  }, [targetStudentId, schoolId, userLoading]);

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

  // Filter classrooms by selected grade & term
  const availableClassrooms = useMemo(() => {
    let list = classrooms;
    if (selectedGradeId && selectedGradeId !== "all") {
      list = list.filter((c) => c.grade_id === selectedGradeId);
    }
    if (selectedTermId && selectedTermId !== "all") {
      list = list.filter((c) => c.term_id === selectedTermId || !c.term_id);
    }
    return list;
  }, [classrooms, selectedGradeId, selectedTermId]);

  // Enriched list of all enrollments
  const enrollmentHistory = useMemo(() => {
    if (!student) return [];

    const list = Array.isArray(student.enrollments) ? [...student.enrollments] : [];

    // Also include current classroom/term if not in enrollments array
    if (
      student.classroom_id &&
      student.term_id &&
      !list.some(
        (e) => e.classroom_id === student.classroom_id && e.term_id === student.term_id
      )
    ) {
      list.push({
        classroom_id: student.classroom_id,
        term_id: student.term_id,
      });
    }

    const mapped = list.map((item, index) => {
      const term = termMap.get(item.term_id) || student.term;
      const classroom = classroomMap.get(item.classroom_id) || student.classroom;
      const isCurrent =
        Boolean(
          student.classroom_id &&
          student.term_id &&
          item.classroom_id === student.classroom_id &&
          item.term_id === student.term_id
        );

      return {
        id: `${item.classroom_id}-${item.term_id}-${index}`,
        termId: item.term_id,
        classroomId: item.classroom_id,
        termYear: term?.year || `Term ${item.term_id ? item.term_id.slice(-4) : ""}`,
        classroomName: classroom?.name || "ថ្នាក់មិនស្គាល់",
        gradeName: (classroom as any)?.grade?.name || "ទូទៅ",
        isCurrent,
        originalIndex: index,
      };
    });

    // Sort so that 'Current' is always displayed at the TOP, followed by past enrollments in reverse chronological order
    return mapped.sort((a, b) => {
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
      return b.originalIndex - a.originalIndex;
    });
  }, [student, termMap, classroomMap]);

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !selectedClassroomId || !selectedTermId) {
      toast.error("សូមជ្រើសរើសឆមាស និងថ្នាក់រៀន (Please select term & classroom)");
      return;
    }

    setIsSubmitting(true);
    try {
      await API.put(`/students/${student._id}/classroom`, {
        classroom_id: selectedClassroomId,
        term_id: selectedTermId,
      });

      toast.success("បានចុះឈ្មោះសិស្សចូលថ្នាក់រៀនដោយជោគជ័យ! (Enrolled successfully)");

      const updatedEnrollments = [
        ...(student.enrollments || []),
        { classroom_id: selectedClassroomId, term_id: selectedTermId },
      ];

      setStudent({
        ...student,
        classroom_id: selectedClassroomId,
        term_id: selectedTermId,
        classroom: classroomMap.get(selectedClassroomId) || student.classroom,
        term: termMap.get(selectedTermId) || student.term,
        enrollments: updatedEnrollments,
      });
    } catch (err: any) {
      console.error("Failed to enroll student:", err);
      toast.error(
        err?.response?.data?.error || "បរាជ័យក្នុងការចុះឈ្មោះសិស្ស (Failed to enroll student)"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || userLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-6xl">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="h-96 lg:col-span-5 rounded-2xl" />
          <Skeleton className="h-96 lg:col-span-7 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!student && !loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-3xl">
        <Card className="border-destructive/30 bg-destructive/5 text-center py-12">
          <CardContent className="space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold text-foreground">រកមិនឃើញទិន្នន័យសិស្សឡើយ (Student Not Found)</h2>
            <p className="text-sm text-muted-foreground">
              សិស្សដែលអ្នកកំពុងស្វែងរកមិនមាននៅក្នុងប្រព័ន្ធ ឬត្រូវបានលុប។
            </p>
            <Button variant="outline" onClick={() => navigate("/school/student")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>ត្រឡប់ទៅកាន់បញ្ជីសិស្ស</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentClassroom =
    classroomMap.get(student?.classroom_id || "") || student?.classroom;
  const currentTerm = termMap.get(student?.term_id || "") || student?.term;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-6xl animate-in fade-in-50 duration-200">
      {/* 1. Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/school/student")}
            className="h-9 gap-1.5 text-xs shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>បញ្ជីសិស្ស (Students List)</span>
          </Button>

          <span className="text-muted-foreground hidden sm:inline">•</span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/school/enrollment")}
            className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground hidden sm:flex"
          >
            <BookOpenCheck className="h-4 w-4 text-primary" />
            <span>ទំព័រចុះឈ្មោះរួម (All Enrollments)</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchEnrollmentDetail(true)}
            disabled={refreshing}
            className="h-9 gap-1.5 text-xs"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-primary" : ""}`} />
            <span>ផ្ទុកឡើងវិញ</span>
          </Button>
        </div>
      </div>

      {/* 2. Hero Student Identity Banner */}
      <Card className="border shadow-xs overflow-hidden bg-gradient-to-r from-primary/15 via-primary/5 to-background">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 md:h-24 md:w-24 rounded-2xl ring-4 ring-background shadow-lg shrink-0">
                <AvatarImage src={student?.profileUrl} alt={student?.name} />
                <AvatarFallback className="text-3xl font-extrabold bg-primary/20 text-primary">
                  {student?.name ? student.name.charAt(0).toUpperCase() : "S"}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                    {student?.name}
                  </h1>
                  <Badge
                    variant={student?.status === "inactive" ? "secondary" : "default"}
                    className="text-xs px-2.5 py-0.5"
                  >
                    {student?.status === "inactive" ? "អសកម្ម" : "សកម្ម (Active)"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {student?.sex === "female" ? "ស្រី (Female)" : "ប្រុស (Male)"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground">អត្តលេខ:</span>
                    <strong className="font-mono text-primary font-bold text-sm">
                      {student?.id_number || student?._id.slice(-6)}
                    </strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>ទូរស័ព្ទ:</span>
                    <a
                      href={`tel:${student?.parentPhone}`}
                      className="font-mono text-foreground font-semibold hover:underline"
                    >
                      {student?.parentPhone || "មិនមាន"}
                    </a>
                  </div>

                  {student?.dob && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>ថ្ងៃខែឆ្នាំកំណើត:</span>
                      <span className="text-foreground">{student.dob}</span>
                    </div>
                  )}

                  {student?.address && (
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{student.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Status Tag */}
            <div className="flex flex-col items-start md:items-end justify-center gap-1 bg-background/80 backdrop-blur-sm border rounded-xl p-4 shadow-xs shrink-0">
              <span className="text-[11px] font-semibold text-muted-foreground">ស្ថានភាពចុះឈ្មោះ</span>
              <div className="flex items-center gap-2">
                {currentClassroom && currentTerm ? (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-xs gap-1 py-1 px-2.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>បានចុះឈ្មោះក្នុងថ្នាក់</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-xs py-1 px-2.5">
                    <span>មិនទាន់ចាត់ថ្នាក់</span>
                  </Badge>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                សរុបបានចូលរៀន: <strong>{enrollmentHistory.length} ឆមាស</strong>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Current Enrollment & Re-Enroll Form */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Enrollment Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Current Term */}
            <Card className="border shadow-xs bg-muted/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  ឆមាសបច្ចុប្បន្ន
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentTerm ? (
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-foreground">
                      ឆមាស {currentTerm.year || currentTerm._id.slice(-4)}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] text-emerald-600 border-emerald-300 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                    >
                      សកម្ម (Active)
                    </Badge>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">មិនទាន់បានចាត់ឆមាស</span>
                )}
              </CardContent>
            </Card>

            {/* Current Classroom */}
            <Card className="border shadow-xs bg-muted/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <DoorOpen className="h-4 w-4 text-primary" />
                  បន្ទប់រៀនបច្ចុប្បន្ន
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentClassroom ? (
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-foreground">
                      {currentClassroom.name}
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {(currentClassroom as any).grade?.name || "Grade"}
                    </Badge>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">មិនទាន់បានចាត់ថ្នាក់</span>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enroll / Transfer Classroom Card */}
          <Card className="border shadow-xs bg-card">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                ចុះឈ្មោះចូលថ្នាក់ / ប្តូរថ្នាក់រៀន
              </CardTitle>
              <CardDescription className="text-xs">
                ជ្រើសរើសឆមាស និងបន្ទប់រៀនដើម្បីចុះឈ្មោះសិស្សសម្រាប់វគ្គសិក្សា
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleEnrollSubmit} className="space-y-4">
                {/* Select Term */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    ឆមាសសិក្សា (Academic Term) <span className="text-destructive">*</span>
                  </label>
                  <Select value={selectedTermId} onValueChange={setSelectedTermId}>
                    <SelectTrigger className="h-10 text-xs bg-background">
                      <SelectValue placeholder="ជ្រើសរើសឆមាសសិក្សា" />
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

                {/* Filter by Grade */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    កម្រិតថ្នាក់ (Grade Filter)
                  </label>
                  <Select value={selectedGradeId} onValueChange={setSelectedGradeId}>
                    <SelectTrigger className="h-10 text-xs bg-background">
                      <SelectValue placeholder="កម្រិតថ្នាក់ទាំងអស់ (All Grades)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">កម្រិតថ្នាក់ទាំងអស់</SelectItem>
                      {grades.map((g) => (
                        <SelectItem key={g._id} value={g._id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Select Classroom */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <DoorOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    បន្ទប់រៀន (Target Classroom) <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={selectedClassroomId}
                    onValueChange={setSelectedClassroomId}
                    disabled={availableClassrooms.length === 0}
                  >
                    <SelectTrigger className="h-10 text-xs bg-background">
                      <SelectValue placeholder="ជ្រើសរើសបន្ទប់រៀន" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableClassrooms.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name} {c.grade_id ? `(${(c as any).grade?.name || "Grade"})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !selectedClassroomId || !selectedTermId}
                    className="w-full h-11 text-xs sm:text-sm font-bold gap-2 shadow-xs"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>កំពុងរក្សាទុកការចុះឈ្មោះ...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>រក្សាទុកការចុះឈ្មោះ (Save Enrollment)</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (7 cols): Full Enrollment History Timeline & Table */}
        <div className="lg:col-span-7">
          <Card className="border shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/10 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  ប្រវត្តិនៃការចុះឈ្មោះចូលរៀន (Enrollment History)
                </CardTitle>
                <CardDescription className="text-xs">
                  កំណត់ត្រាឆមាស និងបន្ទប់រៀនដែលសិស្សធ្លាប់បានចូលរៀនតាំងពីដើមមក
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs font-mono">
                {enrollmentHistory.length} កំណត់ត្រា
              </Badge>
            </CardHeader>

            <CardContent className="p-0">
              {enrollmentHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="text-xs py-3.5">ឆមាសសិក្សា (Term)</TableHead>
                        <TableHead className="text-xs py-3.5">បន្ទប់រៀន (Classroom)</TableHead>
                        <TableHead className="text-xs py-3.5">កម្រិតថ្នាក់ (Grade)</TableHead>
                        <TableHead className="text-xs py-3.5 text-right">ស្ថានភាព (Status)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollmentHistory.map((item) => (
                        <TableRow
                          key={item.id}
                          className={`transition-colors ${
                            item.isCurrent ? "bg-primary/5 font-semibold" : "hover:bg-muted/20"
                          }`}
                        >
                          <TableCell className="py-4 text-xs">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Calendar className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground text-sm">{item.termYear}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">
                                  ID: {item.termId.slice(-6)}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="py-4 text-xs">
                            <div className="flex items-center gap-2">
                              <DoorOpen className="h-4 w-4 text-primary shrink-0" />
                              <span className="font-bold text-foreground text-sm">
                                {item.classroomName}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="py-4 text-xs">
                            <Badge variant="outline" className="text-xs font-normal">
                              {item.gradeName}
                            </Badge>
                          </TableCell>

                          <TableCell className="py-4 text-xs text-right">
                            {item.isCurrent ? (
                              <Badge className="text-xs bg-emerald-500 hover:bg-emerald-600 gap-1 font-semibold">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                បច្ចុប្បន្ន (Current)
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                ប្រវត្តិ (Past)
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
                  <GraduationCap className="h-10 w-10 mx-auto opacity-30 stroke-1" />
                  <p className="font-medium text-sm">មិនទាន់មានប្រវត្តិការចុះឈ្មោះចូលរៀននៅឡើយទេ</p>
                  <p className="text-xs text-muted-foreground">
                    សូមប្រើទម្រង់ខាងឆ្វេងដើម្បីចុះឈ្មោះសិស្សចូលថ្នាក់ដំបូង
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

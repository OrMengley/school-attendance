import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import API from "../../lib/axios";
import { useUser } from "../../context/UserContext";
import type { StudentType } from "../../types/Student";
import type { TermType } from "../../types/Term";
import type { ClassroomType } from "../../types/Classroom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Separator } from "../../components/ui/separator";
import CreateStudentModal from "../../components/school/school-studentModal";

import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  CalendarDays,
  MapPin,
  Building,
  GraduationCap,
  DoorOpen,
  BookOpenCheck,
  Edit,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  History,
  IdCard,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function SchoolStudentDetail() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();

  const [student, setStudent] = useState<StudentType | null>(null);
  const [terms, setTerms] = useState<TermType[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const schoolId = user?.school_id || "";

  const fetchStudentData = async (isManual = false) => {
    if (!studentId || !schoolId) {
      if (!userLoading) setLoading(false);
      return;
    }

    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [studentRes, studentsRes, termsRes, classroomsRes] = await Promise.allSettled([
        API.get(`/student/${studentId}`),
        API.get(`/students/school/${schoolId}`),
        API.get(`/terms?school_id=${schoolId}`),
        API.get(`/classrooms/school/${schoolId}`),
      ]);

      if (termsRes.status === "fulfilled" && Array.isArray(termsRes.value.data)) {
        setTerms(termsRes.value.data);
      }
      if (classroomsRes.status === "fulfilled" && Array.isArray(classroomsRes.value.data)) {
        setClassrooms(classroomsRes.value.data);
      }

      let loadedStudent: StudentType | null = null;
      if (studentRes.status === "fulfilled" && studentRes.value.data && studentRes.value.data._id) {
        loadedStudent = studentRes.value.data;
      } else if (studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value.data)) {
        const found = studentsRes.value.data.find((s: StudentType) => s._id === studentId);
        if (found) loadedStudent = found;
      }

      if (loadedStudent) {
        setStudent(loadedStudent);
      }

      if (isManual) {
        toast.success("ទិន្នន័យត្រូវបានធ្វើបច្ចុប្បន្នភាព! (Refreshed)");
      }
    } catch (err) {
      console.error("Failed to load student details:", err);
      toast.error("បរាជ័យក្នុងការទាញយកព័ត៌មានលម្អិតរបស់សិស្ស");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!userLoading) {
      fetchStudentData();
    }
  }, [studentId, schoolId, userLoading]);

  // Lookup Maps
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

  // Enriched Enrollment History
  const enrollmentHistory = useMemo(() => {
    if (!student) return [];

    const list = Array.isArray(student.enrollments) ? [...student.enrollments] : [];

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
      const isCurrent = Boolean(
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

    return mapped.sort((a, b) => {
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
      return b.originalIndex - a.originalIndex;
    });
  }, [student, termMap, classroomMap]);

  // Format Date of birth helper
  const formattedDob = useMemo(() => {
    if (!student?.dob) return "មិនបានបញ្ជាក់ (Not specified)";
    try {
      const d = new Date(student.dob);
      if (!isNaN(d.getTime())) {
        return format(d, "dd MMMM yyyy");
      }
      return student.dob;
    } catch {
      return student.dob;
    }
  }, [student?.dob]);

  // Calculate age if DOB exists
  const calculatedAge = useMemo(() => {
    if (!student?.dob) return null;
    try {
      const dobDate = new Date(student.dob);
      if (isNaN(dobDate.getTime())) return null;
      const diffMs = Date.now() - dobDate.getTime();
      const ageDt = new Date(diffMs);
      const age = Math.abs(ageDt.getUTCFullYear() - 1970);
      return age >= 0 && age < 120 ? age : null;
    } catch {
      return null;
    }
  }, [student?.dob]);

  // Adapter for edit modal
  const adaptStudentForEdit = (s: StudentType) => {
    const firstEnrollment = s.enrollments?.[0];
    return {
      _id: s._id || "",
      name: s.name || "",
      firstName: s.firstName || "",
      lastName: s.lastName || "",
      dob: s.dob || "",
      address: s.address || "",
      profileUrl: s.profileUrl || "",
      parentPhone: s.parentPhone || "",
      status: s.status || "active",
      enrollments: s.enrollments || [],
      classroom_id: firstEnrollment?.classroom_id || s.classroom_id || "",
      term_id: firstEnrollment?.term_id || s.term_id || "",
      createdAt: s.createdAt || new Date().toISOString(),
    };
  };

  if (loading || userLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-6xl">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-44 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="h-96 lg:col-span-7 rounded-2xl" />
          <Skeleton className="h-96 lg:col-span-5 rounded-2xl" />
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
              សិស្សដែលអ្នកកំពុងស្វែងរកមិនមាននៅក្នុងប្រព័ន្ធ ឬត្រូវបានលុបចេញពីមូលដ្ឋានទិន្នន័យ។
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
      {/* 1. Top Action & Navigation Header */}
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
            <span>ទំព័រចុះឈ្មោះ (Enrollment Hub)</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/school/student/${student?._id}/enrollment`)}
            className="h-9 gap-1.5 text-xs text-primary border-primary/25 hover:bg-primary/10 transition-colors"
          >
            <BookOpenCheck className="h-4 w-4" />
            <span>ការចុះឈ្មោះ (Enrollment)</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="h-9 gap-1.5 text-xs"
          >
            <Edit className="h-4 w-4" />
            <span>កែប្រែព័ត៌មាន (Edit)</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStudentData(true)}
            disabled={refreshing}
            className="h-9 gap-1.5 text-xs"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-primary" : ""}`} />
            <span>ផ្ទុកឡើងវិញ</span>
          </Button>
        </div>
      </div>

      {/* 2. Hero Profile Banner */}
      <Card className="border shadow-xs overflow-hidden bg-gradient-to-r from-primary/15 via-primary/5 to-background">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 md:h-24 md:w-24 rounded-2xl ring-4 ring-background shadow-lg shrink-0">
                <AvatarImage src={student?.profileUrl} alt={student?.name} className="object-cover" />
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
                    {student?.status === "inactive" ? "អសកម្ម (Inactive)" : "សកម្ម (Active)"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs ${student?.sex === "female"
                      ? "text-pink-600 border-pink-200 bg-pink-50 dark:bg-pink-950/30"
                      : "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30"
                      }`}
                  >
                    {student?.sex === "female" ? "ស្រី (Female)" : "ប្រុស (Male)"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground">អត្តលេខសិស្ស:</span>
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
                      <span className="text-foreground">{formattedDob}</span>
                      {calculatedAge !== null && (
                        <span className="text-muted-foreground">({calculatedAge} ឆ្នាំ)</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Status Tag */}
            <div className="flex flex-col items-start md:items-end justify-center gap-1 bg-background/80 backdrop-blur-sm border rounded-xl p-4 shadow-xs shrink-0">
              <span className="text-[11px] font-semibold text-muted-foreground">ស្ថានភាពថ្នាក់រៀន</span>
              <div className="flex items-center gap-2">
                {currentClassroom && currentTerm ? (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-xs gap-1 py-1 px-2.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{currentClassroom.name}</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-xs py-1 px-2.5">
                    <span>មិនទាន់ចាត់ថ្នាក់</span>
                  </Badge>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                ឆមាស: <strong>{currentTerm?.year || "គ្មាន"}</strong>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Main Detail Grid (Personal Info + Academic Info) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Detailed Personal & Guardian Info */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Personal Information */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                ព័ត៌មានផ្ទាល់ខ្លួន (Personal Information)
              </CardTitle>
              <CardDescription className="text-xs">
                ព័ត៌មានអត្តសញ្ញាណ និងប្រវត្តិកំណើតរបស់សិស្ស
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 bg-muted/20 p-3 rounded-xl border">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    ត្រកូល (First Name)
                  </span>
                  <p className="text-sm font-semibold text-foreground">
                    {student?.firstName || "មិនបានបញ្ជាក់"}
                  </p>
                </div>

                <div className="space-y-1 bg-muted/20 p-3 rounded-xl border">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    ឈ្មោះ (Last Name)
                  </span>
                  <p className="text-sm font-semibold text-foreground">
                    {student?.lastName || "មិនបានបញ្ជាក់"}
                  </p>
                </div>

                <div className="space-y-1 bg-muted/20 p-3 rounded-xl border">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    ឈ្មោះពេញ (Full Name)
                  </span>
                  <p className="text-sm font-bold text-foreground">
                    {student?.name || "មិនបានបញ្ជាក់"}
                  </p>
                </div>

                <div className="space-y-1 bg-muted/20 p-3 rounded-xl border">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                    ភេទ (Gender)
                  </span>
                  <p className="text-sm font-semibold text-foreground">
                    {student?.sex === "female" ? "ស្រី (Female)" : student?.sex === "male" ? "ប្រុស (Male)" : "មិនបានបញ្ជាក់"}
                  </p>
                </div>

                <div className="space-y-1 bg-muted/20 p-3 rounded-xl border">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    ថ្ងៃខែឆ្នាំកំណើត (Date of Birth)
                  </span>
                  <p className="text-sm font-semibold text-foreground">
                    {formattedDob}
                  </p>
                  {calculatedAge !== null && (
                    <p className="text-xs text-muted-foreground font-medium">អាយុ: {calculatedAge} ឆ្នាំ</p>
                  )}
                </div>

                <div className="space-y-1 bg-muted/20 p-3 rounded-xl border">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <IdCard className="h-3.5 w-3.5 text-muted-foreground" />
                    អត្តលេខសិស្ស (Student ID)
                  </span>
                  <p className="text-sm font-bold font-mono text-primary">
                    {student?.id_number || student?._id}
                  </p>
                </div>

                <div className="sm:col-span-2 space-y-1 bg-muted/20 p-3 rounded-xl border">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    អាសយដ្ឋានបច្ចុប្បន្ន (Address)
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    {student?.address || "មិនបានបញ្ជាក់"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Guardian / Parent Info */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                ព័ត៌មានអាណាព្យាបាល & ទំនាក់ទំនង (Guardian & Contact)
              </CardTitle>
              <CardDescription className="text-xs">
                ព័ត៌មានទំនាក់ទំនងសម្រាប់ផ្ញើសារ និងទាក់ទងពេលចាំបាច់
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-muted/20 rounded-xl border">
                <div>
                  <span className="text-xs font-medium text-muted-foreground block">
                    លេខទូរស័ព្ទអាណាព្យាបាល (Parent Phone)
                  </span>
                  <span className="text-base font-mono font-bold text-foreground">
                    {student?.parentPhone || "មិនមានលេខទូរស័ព្ទ"}
                  </span>
                </div>
                {student?.parentPhone && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`tel:${student?.parentPhone}`)}
                    className="gap-1.5 text-xs h-8"
                  >
                    <Phone className="h-3.5 w-3.5 text-emerald-600" />
                    <span>ខលទាក់ទង (Call)</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (5 cols): Academic Status & Enrollment Details */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Current Academic Status */}
          <Card className="border shadow-xs bg-card">
            <CardHeader className="pb-3 border-b bg-muted/10 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  ព័ត៌មានសិក្សាបច្ចុប្បន្ន (Academic)
                </CardTitle>
                <CardDescription className="text-xs">
                  បន្ទប់រៀន និងឆមាសសកម្មដែលសិស្សកំពុងសិក្សា
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Classroom Info */}
              <div className="space-y-1.5 p-3.5 bg-muted/20 rounded-xl border">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <DoorOpen className="h-3.5 w-3.5 text-primary" />
                  បន្ទប់សិក្សា (Classroom)
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-foreground">
                    {currentClassroom?.name || "មិនទាន់ចាត់ថ្នាក់"}
                  </span>
                  {currentClassroom?.grade_id && (
                    <Badge variant="secondary" className="text-xs">
                      {(currentClassroom as any)?.grade?.name || "Grade"}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Term Info */}
              <div className="space-y-1.5 p-3.5 bg-muted/20 rounded-xl border">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  ឆមាសសិក្សា (Academic Term)
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-foreground">
                    {currentTerm?.year ? `ឆមាស ${currentTerm.year}` : "មិនទាន់ចាត់ឆមាស"}
                  </span>
                  {currentTerm && (
                    <Badge className="bg-emerald-500 text-xs">
                      សកម្ម (Active)
                    </Badge>
                  )}
                </div>
              </div>

              {/* Quick Jump to Enrollment Page */}
              <div className="pt-2">
                <Button
                  onClick={() => navigate(`/school/student/${student?._id}/enrollment`)}
                  className="w-full gap-2 text-xs h-10 font-bold"
                >
                  <BookOpenCheck className="h-4 w-4" />
                  <span>គ្រប់គ្រងការចុះឈ្មោះ / ប្តូរថ្នាក់ (Enrollment)</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card: System Information */}
          <Card className="border shadow-xs bg-muted/10">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                ព័ត៌មានប្រព័ន្ធ (System Details)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs text-muted-foreground">
              {/* <div className="flex justify-between items-center">
                <span>លេខសម្គាល់ប្រព័ន្ធ:</span>
                <span className="font-mono text-foreground font-semibold">{student?._id}</span>
              </div> */}
              {/* <Separator /> */}
              <div className="flex justify-between items-center">
                <span>កាលបរិច្ឆេទបង្កើត:</span>
                <span className="text-foreground">
                  {student?.createdAt ? format(new Date(student.createdAt), "dd/MM/yyyy HH:mm") : "មិនមាន"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span>ចំនួនឆមាសបានចុះឈ្មោះ:</span>
                <Badge variant="secondary" className="font-mono text-xs font-bold">
                  {enrollmentHistory.length} ឆមាស
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. Full Enrollment History Timeline & Table */}
      <Card className="border shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b bg-muted/10 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              ប្រវត្តិនៃការចុះឈ្មោះចូលរៀន (Enrollment History)
            </CardTitle>
            <CardDescription className="text-xs">
              កំណត់ត្រាឆមាស និងបន្ទប់រៀនដែលសិស្សធ្លាប់បានចូលរៀន
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
                      className={`transition-colors ${item.isCurrent ? "bg-primary/5 font-semibold" : "hover:bg-muted/20"
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
                              ID: {item.termId ? item.termId.slice(-6) : "-"}
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
            <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
              <GraduationCap className="h-10 w-10 mx-auto opacity-30 stroke-1" />
              <p className="font-medium text-sm">មិនទាន់មានប្រវត្តិការចុះឈ្មោះចូលរៀននៅឡើយទេ</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Student Modal if triggered */}
      {student && (
        <CreateStudentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={adaptStudentForEdit(student)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            fetchStudentData();
          }}
        />
      )}
    </div>
  );
}

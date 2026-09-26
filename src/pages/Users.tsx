import { useEffect, useState, useMemo } from "react";
import API from "../lib/axios";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Users,
  Plus,
  Mail,
  Shield,
  School as SchoolIcon,
  AlertCircle,
  KeyRound,
  Edit,
  Search,
  UserCheck,
  UserX,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import ChangePasswordModal, { type PasswordUser } from "../components/ChangePasswordModal";
import SuperAdminUserEditModal, { type SuperAdminEditUser } from "../components/SuperAdminUserEditModal";
import type { SchoolType } from "../types/SchoolType";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  schoolId?: string;
  school_id?: string;
  status?: string;
  avatar_url?: string;
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modals state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<PasswordUser | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<SuperAdminEditUser | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [usersRes, schoolsRes] = await Promise.all([
        API.get("/users"),
        API.get("/schools").catch(() => ({ data: [] })),
      ]);

      if (Array.isArray(usersRes.data)) {
        setUsers(usersRes.data);
      } else {
        setUsers([]);
      }

      if (Array.isArray(schoolsRes.data)) {
        setSchools(schoolsRes.data);
      }

      setError(null);
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Failed to fetch users:", err);
      setError(`Failed to fetch users: ${errorMessage}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const schoolMap = useMemo(() => {
    const map = new Map<string, string>();
    schools.forEach((s) => map.set(s._id, s.name));
    return map;
  }, [schools]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u._id?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "admin":
        return "default";
      case "teacher":
        return "secondary";
      case "parent":
        return "outline";
      default:
        return "outline";
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleChangePassword = (user: User) => {
    setSelectedUserForPassword({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.school_id || user.schoolId,
    });
    setPasswordModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUserForEdit({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      school_id: user.school_id || user.schoolId,
      status: user.status,
    });
    setEditModalOpen(true);
  };

  if (loading && users.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground mt-2">Manage system users and their credentials</p>
          </div>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-60" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground mt-2">Manage system users and their credentials</p>
          </div>
          <Link to="/creator/user">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </Link>
        </div>

        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            View, edit, and change passwords for all system users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchUsers} title="Refresh users">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Link to="/creator/user">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create User
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">All System Users</CardTitle>
                <Badge variant="secondary">
                  {filteredUsers.length} of {users.length}
                </Badge>
              </div>
              <CardDescription className="mt-1">
                Manage roles, passwords, and school assignments
              </CardDescription>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, email, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-40 h-9">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">School Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-1">No users found</h3>
              <p className="text-muted-foreground text-sm max-w-sm mb-4">
                {searchQuery || roleFilter !== "all"
                  ? "No users match your filter criteria. Try clearing search filters."
                  : "Get started by creating your first system user."}
              </p>
              {searchQuery || roleFilter !== "all" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setRoleFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Link to="/creator/user">
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create User
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, idx) => {
                    const sid = user.school_id || user.schoolId;
                    const schoolName = sid ? schoolMap.get(sid) || sid : "—";
                    const isStatusActive = (user.status || "active") === "active";

                    return (
                      <TableRow key={user._id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="text-muted-foreground font-medium text-xs">
                          {idx + 1}
                        </TableCell>

                        {/* Name + Avatar */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-sm leading-tight text-foreground">
                                {user.name}
                              </div>
                              <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                ID: {user._id.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Email */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-foreground/90">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>{user.email}</span>
                          </div>
                        </TableCell>

                        {/* Role Badge */}
                        <TableCell>
                          <Badge
                            variant={getRoleBadgeVariant(user.role)}
                            className="flex items-center gap-1 w-fit capitalize font-medium text-xs"
                          >
                            <Shield className="h-3 w-3" />
                            {user.role === "admin"
                              ? "School Admin"
                              : user.role?.replace("_", " ")}
                          </Badge>
                        </TableCell>

                        {/* School */}
                        <TableCell>
                          {sid ? (
                            <div className="flex items-center gap-1.5 text-sm text-foreground/80">
                              <SchoolIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate max-w-[180px]" title={schoolName}>
                                {schoolName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge
                            variant={isStatusActive ? "default" : "secondary"}
                            className="gap-1 font-medium text-xs"
                          >
                            {isStatusActive ? (
                              <UserCheck className="h-3 w-3" />
                            ) : (
                              <UserX className="h-3 w-3" />
                            )}
                            {isStatusActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>

                        {/* Action buttons */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleChangePassword(user)}
                              className="h-8 gap-1.5 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50 border-amber-200"
                              title="Change User Password"
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                              Change Pass
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditUser(user)}
                              className="h-8 gap-1 text-xs hover:bg-muted"
                              title="Edit User"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        user={selectedUserForPassword}
        onSuccess={fetchUsers}
      />

      {/* Edit User Modal (also includes inline password reset) */}
      <SuperAdminUserEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={selectedUserForEdit}
        onSaved={fetchUsers}
      />
    </div>
  );
}
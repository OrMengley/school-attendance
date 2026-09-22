// src/pages/school/SchoolUser.tsx (or wherever your UserTable lives)
import { useState } from "react";
import useFetchData from "../../hooks/useFetchData";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Skeleton } from "../../components/ui/skeleton";
import SchoolUserCreateModal from "../../components/school/school-createUserModal";
import SchoolUserEditModal from "../../components/school/School-userEditModal";
import UserDetail from "../../components/school/school_user_detail";
import type { EditUser } from "../../components/school/School-userEditModal";
import type {UserType} from "../../types/User";
import { Users, Plus, Edit, School, Mail, UserCheck, UserX, Eye } from "lucide-react";


export default function UserTable() {
  const { data: users, loading, refetch } = useFetchData<UserType>("/users");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState<UserType | null>(null);
  const [viewingUser, setViewingUser] = useState<UserType | null>(null);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Users</CardTitle>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[160px]" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ensure users is always an array
  const userList = users || [];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      case 'teacher': return 'secondary';
      case 'parent': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'active' ? 'default' : 'secondary';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewDetail = (user: UserType) => {
    setViewingUser(user);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">User Management</CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm">
                {userList.length} {userList.length === 1 ? 'User' : 'Users'}
              </Badge>
              <Button onClick={() => setCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create User
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {userList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-gray-500 mb-6 max-w-sm">
                Get started by creating your first user account for the school system.
              </p>
              <Button onClick={() => setCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First User
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    {/* <TableHead>School</TableHead> */}
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userList.map((u, index) => (
                    <TableRow key={u._id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-500">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className={`${u.avatar_url ? '' : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold'}`}>
                              {u.avatar_url ? (
                                <img 
                                  src={u.avatar_url} 
                                  alt={u.name} 
                                  className="h-full w-full object-cover alig"
                                />
                              ) : (
                                getInitials(u.name)
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{u.name}</div>
                            <div className="text-sm text-gray-500">ID: {u._id.slice(-8)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{u.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(u.role)} className="font-medium">
                          {u.role === 'super_admin' ? 'Super Admin' : 
                           u.role === 'admin' ? 'School Admin' : 
                           u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </Badge>
                      </TableCell>
                      {/* <TableCell>
                        <div className="flex items-center gap-2">
                          <School className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{u.school_id || '—'}</span>
                        </div>
                      </TableCell> */}
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(u.status || 'active')} 
                          className="gap-1 font-medium"
                        >
                          {(u.status || 'active') === 'active' ? (
                            <UserCheck className="h-3 w-3" />
                          ) : (
                            <UserX className="h-3 w-3" />
                          )}
                          {(u.status || 'active').charAt(0).toUpperCase() + (u.status || 'active').slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(u)}
                            className="gap-1 hover:bg-blue-50 hover:border-blue-200"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditing(u);
                              setEditOpen(true);
                            }}
                            className="gap-1 hover:bg-blue-50 hover:border-blue-200"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create */}
      <SchoolUserCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refetch}
      />

      {/* Edit */}
      <SchoolUserEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={
          editing
            ? ({
                id: editing._id,
                name: editing.name,
                email: editing.email,
                role: editing.role as EditUser["role"],
                schoolId: editing.school_id,
                status: editing.status as EditUser["status"],
              } as EditUser)
            : null
        }
        onSaved={refetch}
      />

      {/* Detail */}
      <UserDetail
      
        user={viewingUser}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Users, Eye, Filter, Shield, UserX, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  _id: string;
  email: string;
  full_name?: string;
  company?: string;
  company_name?: string;
  role: 'user' | 'admin';
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [roleChangeOpen, setRoleChangeOpen] = useState(false);
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [updatingRole, setUpdatingRole] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (roleFilter === 'all') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(u => u.role === roleFilter));
    }
  };

  const updateUserRole = async () => {
    if (!selectedUser) return;

    try {
      setUpdatingRole(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser._id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      toast.success('User role updated successfully');
      setRoleChangeOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setUpdatingRole(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ active: !currentActive })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      toast.success(`User ${!currentActive ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <Badge variant="default" className="bg-purple-600">
        <Shield className="h-3 w-3 mr-1" />
        Admin
      </Badge>
    ) : (
      <Badge variant="secondary">User</Badge>
    );
  };

  const getVerifiedBadge = (verified: boolean) => {
    return verified ? (
      <Badge variant="secondary" className="bg-green-600">Verified</Badge>
    ) : (
      <Badge variant="outline">Unverified</Badge>
    );
  };

  const viewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  const openRoleChange = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleChangeOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">User Management</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading users...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-gray-400">Manage user accounts and permissions</p>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">Users</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-400">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Users</CardTitle>
            <CardDescription className="text-gray-400">
              All registered user accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">Company</TableHead>
                      <TableHead className="text-gray-300">Role</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Joined</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id} className="border-gray-700 hover:bg-gray-700/50">
                        <TableCell className="text-white font-medium">
                          {user.full_name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-300">{user.email}</TableCell>
                        <TableCell className="text-gray-300">
                          {user.company || user.company_name || '-'}
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getVerifiedBadge(user.email_verified)}</TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => viewDetails(user)}
                              className="text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openRoleChange(user)}
                              className="text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleUserStatus(user._id, true)}
                              className="text-gray-300 hover:text-white hover:bg-gray-700"
                              title="Toggle user status"
                            >
                              {true ? (
                                <UserCheck className="h-4 w-4 text-green-400" />
                              ) : (
                                <UserX className="h-4 w-4 text-red-400" />
                              )}
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

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                Complete information about this user account
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Full Name</label>
                    <p className="text-white font-medium">
                      {selectedUser.full_name || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-white font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Company</label>
                    <p className="text-white font-medium">
                      {selectedUser.company || selectedUser.company_name || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Role</label>
                    <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email Verification</label>
                    <div className="mt-1">{getVerifiedBadge(selectedUser.email_verified)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">User ID</label>
                    <p className="text-white font-medium text-xs">{selectedUser._id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Account Created</label>
                    <p className="text-white font-medium">
                      {new Date(selectedUser.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Last Updated</label>
                    <p className="text-white font-medium">
                      {new Date(selectedUser.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => {
                  setDetailsOpen(false);
                  if (selectedUser) openRoleChange(selectedUser);
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Shield className="mr-2 h-4 w-4" />
                Change Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Role Change Dialog */}
        <AlertDialog open={roleChangeOpen} onOpenChange={setRoleChangeOpen}>
          <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Change User Role</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Update the role for {selectedUser?.full_name || selectedUser?.email}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label className="text-gray-300 mb-2 block">Select New Role</Label>
              <Select value={newRole} onValueChange={(value: 'user' | 'admin') => setNewRole(value)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {newRole === 'admin' && (
                <p className="text-sm text-yellow-400 mt-2">
                  ⚠️ Admin users have full access to all management features
                </p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={updateUserRole}
                disabled={updatingRole}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {updatingRole ? 'Updating...' : 'Update Role'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

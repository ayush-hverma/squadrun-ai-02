import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, LogOut, Shield, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminPanel() {
  const { user, logout, allowedUsers, addAllowedUser, removeAllowedUser, updateUserRole, hasRole } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [activeTab, setActiveTab] = useState('users');
  const navigate = useNavigate();

  // Redirect if not admin or superadmin
  useEffect(() => {
    if (!hasRole('admin') && !hasRole('superadmin')) {
      navigate('/dashboard');
    }
  }, [hasRole, navigate]);

  const handleAddUser = () => {
    if (!newEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (allowedUsers.some(u => u.email === newEmail.trim())) {
      toast.error('This email is already in the allowed list');
      return;
    }

    try {
      addAllowedUser(newEmail.trim(), newRole);
      setNewEmail('');
      toast.success('User added successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add user');
    }
  };

  const handleRemoveUser = (email: string) => {
    if (email === user?.email) {
      toast.error('You cannot remove yourself from the allowed list');
      return;
    }

    try {
      removeAllowedUser(email);
      toast.success('User removed successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove user');
    }
  };

  const handleRoleChange = (email: string, role: UserRole) => {
    if (email === user?.email) {
      toast.error('You cannot change your own role');
      return;
    }

    try {
      updateUserRole(email, role);
      toast.success('User role updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-500/20 text-red-300';
      case 'admin':
        return 'bg-purple-500/20 text-purple-300';
      default:
        return 'bg-blue-500/20 text-blue-300';
    }
  };

  const canModifyUser = (targetUser: { email: string; role: UserRole }) => {
    if (user?.role === 'superadmin') return true;
    if (user?.role === 'admin') {
      return targetUser.role !== 'superadmin';
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-squadrun-darker p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img
                src={user?.picture}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-white">{user?.name}</span>
              <span className={`px-2 py-1 text-xs rounded ${getRoleColor(user?.role || 'user')}`}>
                {user?.role}
              </span>
            </div>
            <Button
              variant="ghost"
              onClick={logout}
              className="text-sm text-squadrun-gray hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-squadrun-darker border border-squadrun-primary/20">
            <TabsTrigger value="users" className="data-[state=active]:bg-squadrun-primary">
              <Users className="w-4 h-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-squadrun-primary">
              <Shield className="w-4 h-4 mr-2" />
              Role Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50">
              <CardHeader>
                <CardTitle className="text-lg text-white">Add New User</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="bg-squadrun-darker border-squadrun-primary/20 text-white"
                  />
                  <Select 
                    value={newRole} 
                    onValueChange={(value: UserRole) => setNewRole(value)}
                  >
                    <SelectTrigger className="w-[120px] bg-squadrun-darker border-squadrun-primary/20 text-white">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddUser}
                    className="bg-squadrun-primary hover:bg-squadrun-vivid text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <Card className="border border-squadrun-primary/20 bg-squadrun-darker/50">
              <CardHeader>
                <CardTitle className="text-lg text-white">Manage User Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allowedUsers.map((allowedUser) => (
                    <div
                      key={allowedUser.email}
                      className="flex items-center justify-between p-3 bg-squadrun-darker rounded-md border border-squadrun-primary/20"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-white">{allowedUser.email}</span>
                        <span className={`px-2 py-1 text-xs rounded ${getRoleColor(allowedUser.role)}`}>
                          {allowedUser.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {canModifyUser(allowedUser) && (
                          <>
                            <Select 
                              value={allowedUser.role} 
                              onValueChange={(value: UserRole) => handleRoleChange(allowedUser.email, value)}
                              disabled={allowedUser.email === user?.email}
                            >
                              <SelectTrigger className="w-[100px] bg-squadrun-darker border-squadrun-primary/20 text-white">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveUser(allowedUser.email)}
                              className="text-squadrun-gray hover:text-white hover:bg-squadrun-primary/20"
                              disabled={allowedUser.email === user?.email}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 
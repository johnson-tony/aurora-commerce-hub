import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Trash2, ArrowUpDown, Download, UserPlus } from 'lucide-react'; // Added UserPlus for add user
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Assuming these UI components exist in your project
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// --- Type Definitions ---
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  isActive: boolean;
  registeredDate: string;
  lastLogin?: string; // Optional
}

// --- Mock Data for Users ---
const DUMMY_USERS: User[] = [
  {
    id: 'user-001',
    name: 'Alice Smith',
    email: 'alice.s@example.com',
    role: 'admin',
    isActive: true,
    registeredDate: '2023-01-15T10:00:00Z',
    lastLogin: '2025-06-01T14:30:00Z',
  },
  {
    id: 'user-002',
    name: 'Bob Johnson',
    email: 'bob.j@example.com',
    role: 'customer',
    isActive: true,
    registeredDate: '2023-03-20T11:30:00Z',
    lastLogin: '2025-05-28T09:15:00Z',
  },
  {
    id: 'user-003',
    name: 'Charlie Brown',
    email: 'charlie.b@example.com',
    role: 'customer',
    isActive: false,
    registeredDate: '2023-05-10T15:45:00Z',
    lastLogin: '2025-04-10T10:00:00Z',
  },
  {
    id: 'user-004',
    name: 'Diana Prince',
    email: 'diana.p@example.com',
    role: 'customer',
    isActive: true,
    registeredDate: '2024-02-01T09:00:00Z',
    lastLogin: '2025-06-02T10:00:00Z',
  },
  {
    id: 'user-005',
    name: 'Eve Adams',
    email: 'eve.a@example.com',
    role: 'admin',
    isActive: true,
    registeredDate: '2024-06-01T16:00:00Z',
    lastLogin: '2025-06-02T11:00:00Z',
  },
];

// --- Zod Schema for User Form Validation ---
const userFormSchema = z.object({
  name: z.string().min(1, { message: 'User name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  role: z.enum(['admin', 'customer'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
  isActive: z.boolean(),
});

type UserFormInputs = z.infer<typeof userFormSchema>;

// --- AdminUsers Component ---
const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>(DUMMY_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('registeredDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // State for the inline user detail/edit panel
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // React Hook Form setup for the user details/edit form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UserFormInputs>({
    resolver: zodResolver(userFormSchema),
  });

  // Effect to update the form when a new user is selected for viewing
  useEffect(() => {
    if (selectedUser) {
      reset({
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        isActive: selectedUser.isActive,
      });
      setIsEditingDetails(false); // Start in view mode
    } else {
      reset(); // Clear form when no user is selected
    }
  }, [selectedUser, reset]);

  // Utility function for role badge colors
  const getRoleColor = (role: User['role']) => {
    return role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  // Utility function for status badge colors
  const getActiveStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Memoized filtered and sorted users for performance
  const filteredAndSortedUsers = useMemo(() => {
    let currentUsers = [...users];

    if (searchTerm) {
      currentUsers = currentUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    currentUsers.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'registeredDate') {
        comparison = new Date(a.registeredDate).getTime() - new Date(b.registeredDate).getTime();
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'email') {
        comparison = a.email.localeCompare(b.email);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return currentUsers;
  }, [users, searchTerm, sortBy, sortDirection]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const getSortIndicator = (column: string) => {
    if (sortBy === column) {
      return sortDirection === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  // --- Handlers for Delete and Inline Detail Panel ---
  const handleViewUserClick = (user: User) => {
    setSelectedUser(user);
    setIsViewingDetails(true);
    setIsEditingDetails(false); // Always start in view mode
  };

  const handleCloseDetails = () => {
    setIsViewingDetails(false);
    setSelectedUser(null);
    setIsEditingDetails(false);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm(`Are you sure you want to delete user ${userId}? This action cannot be undone.`)) {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      console.log(`Dummy Delete: User with ID ${userId} deleted.`);
      if (selectedUser && selectedUser.id === userId) {
        handleCloseDetails(); // Close panel if the deleted user was being viewed
      }
    }
  };

  const onSubmitUpdate: SubmitHandler<UserFormInputs> = (data) => {
    if (selectedUser) {
      const updatedUser: User = {
        ...selectedUser,
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
      };
      setUsers(prevUsers => prevUsers.map(u => (u.id === updatedUser.id ? updatedUser : u)));
      setSelectedUser(updatedUser); // Update selectedUser to reflect changes in view mode
      console.log("Dummy Update User:", updatedUser);
      setIsEditingDetails(false); // Exit edit mode
    }
  };

  // Handler for in-table active status toggle
  const handleToggleActiveStatus = (userId: string) => {
    setUsers(prevUsers => prevUsers.map(user =>
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
    }
  };

  // Placeholder for Add User functionality (can be expanded later)
  const handleAddUser = () => {
    alert("Add User functionality will be implemented here!");
    // You would typically open a dialog/form here to collect new user data
  };

  return (
    <div className="min-h-screen bg-soft-ivory font-poppins text-charcoal-gray relative">


      <div className={`max-w-7xl mx-auto px-4 py-8 ${isViewingDetails ? 'pr-md-80' : ''}`}>
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-charcoal-gray">User Management</h1>
            <p className="text-gray-600 mt-1">Manage all registered users and their roles.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAddUser}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Users
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="p-6 mb-6 bg-white flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search users by name, email, role..."
              className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-deep-indigo focus:border-deep-indigo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Users Table */}
        <Card className="bg-white p-0 overflow-hidden">
          {filteredAndSortedUsers.length === 0 ? (
            <p className="p-8 text-center text-gray-600">No users found matching your criteria.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-deep-indigo transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      Name {getSortIndicator('name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-deep-indigo transition-colors"
                      onClick={() => handleSort('registeredDate')}
                    >
                      Registered Date {getSortIndicator('registeredDate')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal-gray">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-charcoal-gray">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`${getActiveStatusColor(user.isActive)} text-sm px-3 py-1.5`}
                          onClick={() => handleToggleActiveStatus(user.id)}
                          title={user.isActive ? "Deactivate User" : "Activate User"}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.registeredDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-deep-indigo hover:bg-deep-indigo/10"
                            onClick={() => handleViewUserClick(user)}
                            title="View User Details"
                          >
                            <Eye className="w-5 h-5" />
                            <span className="sr-only">View User {user.id}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-coral-pink hover:bg-coral-pink/10"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Delete User"
                          >
                            <Trash2 className="w-5 h-5" />
                            <span className="sr-only">Delete User {user.id}</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* --- User Detail/Edit Panel (Inline) --- */}
      {isViewingDetails && selectedUser && (
        <div
          className={`fixed inset-y-0 right-0 z-40 w-full max-w-md bg-white shadow-lg flex flex-col transform transition-transform duration-300
            ${isViewingDetails ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-charcoal-gray">
              User: {selectedUser.name}
            </h2>
            <Button variant="ghost" size="icon" onClick={handleCloseDetails}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit(onSubmitUpdate)} className="space-y-6">
              {/* User Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center text-charcoal-gray">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-4 h-4 mr-2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> User Name
                </Label>
                {isEditingDetails ? (
                  <>
                    <Input id="name" {...register('name')} />
                    {errors.name && (
                      <p className="text-red-500 text-sm">{errors.name.message}</p>
                    )}
                  </>
                ) : (
                  <p className="text-lg font-medium text-gray-800">{selectedUser.name}</p>
                )}
              </div>

              {/* User Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center text-charcoal-gray">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail w-4 h-4 mr-2"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg> User Email
                </Label>
                {isEditingDetails ? (
                  <>
                    <Input id="email" {...register('email')} />
                    {errors.email && (
                      <p className="text-red-500 text-sm">{errors.email.message}</p>
                    )}
                  </>
                ) : (
                  <p className="text-lg font-medium text-gray-800">{selectedUser.email}</p>
                )}
              </div>

              {/* User Role */}
              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center text-charcoal-gray">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield w-4 h-4 mr-2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg> User Role
                </Label>
                {isEditingDetails ? (
                  <>
                    <Select onValueChange={(value: User['role']) => setValue('role', value)}
                      defaultValue={selectedUser.role}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.role && (
                      <p className="text-red-500 text-sm">{errors.role.message}</p>
                    )}
                  </>
                ) : (
                  <Badge className={getRoleColor(selectedUser.role) + " text-lg px-3 py-1.5"}>
                    {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                  </Badge>
                )}
              </div>

              {/* User Active Status (toggle checkbox/switch) */}
              <div className="flex items-center space-x-2 pt-2">
                {isEditingDetails ? (
                  <>
                    <input
                      type="checkbox"
                      id="isActive"
                      {...register('isActive')}
                      className="h-4 w-4 text-deep-indigo focus:ring-deep-indigo border-gray-300 rounded"
                    />
                    <Label htmlFor="isActive" className="text-charcoal-gray">Is Active</Label>
                  </>
                ) : (
                  <div className="flex items-center">
                    <span className="font-medium">Status:</span>
                    <Badge className={`ml-2 ${getActiveStatusColor(selectedUser.isActive)}`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Read-only User Details */}
              <h3 className="text-xl font-semibold text-charcoal-gray mt-8 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info w-5 h-5 mr-2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg> Additional Info
              </h3>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Registered:</span>
                  <span>{new Date(selectedUser.registeredDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Last Login:</span>
                  <span>{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">User ID:</span>
                  <span>{selectedUser.id}</span>
                </div>
              </div>

              {/* Actions for Edit Mode */}
              {isEditingDetails && (
                <div className="flex justify-end space-x-2 mt-8">
                  <Button variant="outline" type="button" onClick={() => { setIsEditingDetails(false); reset(); }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-save w-4 h-4 mr-2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8" /><path d="M7 3v4h4" /></svg> Save Changes
                  </Button>
                </div>
              )}
            </form>
          </div>

          {/* Footer actions (Edit button) */}
          {!isEditingDetails && selectedUser && (
            <div className="p-6 border-t flex justify-end">
              <Button onClick={() => setIsEditingDetails(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit w-4 h-4 mr-2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.37 2.63a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg> Edit User
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
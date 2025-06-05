// src/pages/AdminUsers.tsx
import React, { useState, useMemo, useEffect } from "react";
// No need for Link, Eye, Trash2, Download, UserPlus here anymore as they are in child components
import { Search, ArrowUpDown } from "lucide-react"; // Keep Search and ArrowUpDown if you want them in this file for overall logic

// Import the new components
import UserManagementHeader from "@/components/admincontroluser/UserManagementHeader";
import UserSearchBar from "@/components/admincontroluser/UserSearchBar";
import UserTable from "@/components/admincontroluser/UserTable";
import UserDetailPanel from "@/components/admincontroluser/UserDetailPanel";

// Import shared types and utility functions
import { User, getRoleColor, getActiveStatusColor } from "@/types/user";

// No need for Badge, Select, Label here anymore as they are in child components
import { Card } from "@/components/ui/card"; // Only Card might be needed if it wraps the main content

// --- Mock Data for Users ---
const DUMMY_USERS: User[] = [
  {
    id: "user-001",
    name: "Alice Smith",
    email: "alice.s@example.com",
    role: "admin",
    isActive: true,
    registeredDate: "2023-01-15T10:00:00Z",
    lastLogin: "2025-06-01T14:30:00Z",
  },
  {
    id: "user-002",
    name: "Bob Johnson",
    email: "bob.j@example.com",
    role: "customer",
    isActive: true,
    registeredDate: "2023-03-20T11:30:00Z",
    lastLogin: "2025-05-28T09:15:00Z",
  },
  {
    id: "user-003",
    name: "Charlie Brown",
    email: "charlie.b@example.com",
    role: "customer",
    isActive: false,
    registeredDate: "2023-05-10T15:45:00Z",
    lastLogin: "2025-04-10T10:00:00Z",
  },
  {
    id: "user-004",
    name: "Diana Prince",
    email: "diana.p@example.com",
    role: "customer",
    isActive: true,
    registeredDate: "2024-02-01T09:00:00Z",
    lastLogin: "2025-06-02T10:00:00Z",
  },
  {
    id: "user-005",
    name: "Eve Adams",
    email: "eve.a@example.com",
    role: "admin",
    isActive: true,
    registeredDate: "2024-06-01T16:00:00Z",
    lastLogin: "2025-06-02T11:00:00Z",
  },
];

// Re-declare UserFormInputs type as it's used in onUpdateUser (or import if moved)
type UserFormInputs = {
  name: string;
  email: string;
  role: "admin" | "customer";
  isActive: boolean;
};

// --- AdminUsers Component ---
const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>(DUMMY_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("registeredDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false); // Managed by UserDetailPanel now, but parent controls visibility
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Memoized filtered and sorted users for performance
  const filteredAndSortedUsers = useMemo(() => {
    let currentUsers = [...users];

    if (searchTerm) {
      currentUsers = currentUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    currentUsers.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "registeredDate") {
        comparison =
          new Date(a.registeredDate).getTime() -
          new Date(b.registeredDate).getTime();
      } else if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "email") {
        comparison = a.email.localeCompare(b.email);
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return currentUsers;
  }, [users, searchTerm, sortBy, sortDirection]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

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
    if (
      window.confirm(
        `Are you sure you want to delete user ${userId}? This action cannot be undone.`
      )
    ) {
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      console.log(`Dummy Delete: User with ID ${userId} deleted.`);
      if (selectedUser && selectedUser.id === userId) {
        handleCloseDetails();
      }
    }
  };

  const handleUpdateUser = (userId: string, data: UserFormInputs) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === userId ? { ...u, ...data } : u))
    );
    // Important: Update selectedUser so UserDetailPanel reflects the changes immediately
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser((prevSelectedUser) =>
        prevSelectedUser ? { ...prevSelectedUser, ...data } : null
      );
    }
    console.log("Dummy Update User:", { userId, ...data });
  };

  const handleToggleActiveStatus = (userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, isActive: !user.isActive } : user
      )
    );
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser((prev) =>
        prev ? { ...prev, isActive: !prev.isActive } : null
      );
    }
  };

  const handleAddUser = () => {
    alert("Add User functionality will be implemented here!");
  };

  const handleExportUsers = () => {
    alert("Export Users functionality will be implemented here!");
  };

  return (
    <div className="min-h-screen bg-soft-ivory font-poppins text-charcoal-gray relative">
      <div
        className={`max-w-7xl mx-auto px-4 py-8 ${
          isViewingDetails ? "pr-md-80" : ""
        }`}
      >
        {/* Page Header */}
        <UserManagementHeader
          onAddUser={handleAddUser}
          onExportUsers={handleExportUsers}
        />

        {/* Search Bar */}
        <UserSearchBar
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Users Table */}
        <UserTable
          users={filteredAndSortedUsers}
          sortBy={sortBy}
          sortDirection={sortDirection}
          handleSort={handleSort}
          onViewUserClick={handleViewUserClick}
          onDeleteUser={handleDeleteUser}
          onToggleActiveStatus={handleToggleActiveStatus}
          getRoleColor={getRoleColor} // Pass utility functions
          getActiveStatusColor={getActiveStatusColor} // Pass utility functions
        />
      </div>

      {/* User Detail/Edit Panel (Inline) */}
      <UserDetailPanel
        selectedUser={selectedUser}
        isViewingDetails={isViewingDetails}
        isEditingDetails={isEditingDetails}
        handleCloseDetails={handleCloseDetails}
        setIsEditingDetails={setIsEditingDetails}
        onUpdateUser={handleUpdateUser}
      />
    </div>
  );
};

export default AdminUsers;

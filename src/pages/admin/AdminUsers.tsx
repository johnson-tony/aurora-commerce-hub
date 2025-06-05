// src/pages/AdminUsers.tsx
import React, { useState, useMemo, useEffect } from "react";
import { Search, ArrowUpDown } from "lucide-react";

// Import the new components
import UserManagementHeader from "@/components/admincontroluser/UserManagementHeader";
import UserSearchBar from "@/components/admincontroluser/UserSearchBar";
import UserTable from "@/components/admincontroluser/UserTable";
import UserDetailPanel from "@/components/admincontroluser/UserDetailPanel";

// Import shared types and utility functions
import { User, getActiveStatusColor } from "@/types/user";

import { Card } from "@/components/ui/card";

// Re-declare UserFormInputs type as it's used in onUpdateUser (or import if moved)
type UserFormInputs = {
  name: string;
  email: string;
  isActive: boolean;
};

// Define your API base URL
const API_BASE_URL = "http://localhost:5000/api"; //

// --- AdminUsers Component ---
const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]); // Initialize with an empty array
  const [loading, setLoading] = useState(true); // New loading state
  const [error, setError] = useState<string | null>(null); // New error state

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("registeredDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // --- Fetch Users from API on component mount ---
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Using absolute URL
        const response = await fetch(`${API_BASE_URL}/users`); //
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: User[] = await response.json();

        // Map the data from the database to match your User interface
        const mappedUsers: User[] = data.map((dbUser: any) => ({
          id: dbUser.id.toString(), // Ensure ID is string if your interface expects string
          name: dbUser.name,
          email: dbUser.email,
          isActive: dbUser.status === "active", // Map 'status' to 'isActive'
          registeredDate: dbUser.created_at, // Map 'created_at' to 'registeredDate'
          lastLogin: dbUser.last_login || undefined, // Map 'last_login' to 'lastLogin', handle null/undefined
        }));
        setUsers(mappedUsers);
      } catch (e: any) {
        setError(e.message || "Failed to fetch users.");
        console.error("Failed to fetch users:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // Empty dependency array means this runs once on mount

  // Memoized filtered and sorted users for performance
  const filteredAndSortedUsers = useMemo(() => {
    let currentUsers = [...users];

    if (searchTerm) {
      currentUsers = currentUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleDeleteUser = async (userId: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete user ${userId}? This action cannot be undone.`
      )
    ) {
      try {
        // Use absolute URL
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          //
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`Failed to delete user: ${response.statusText}`);
        }

        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        console.log(`User with ID ${userId} deleted successfully.`);
        if (selectedUser && selectedUser.id === userId) {
          handleCloseDetails();
        }
      } catch (e: any) {
        console.error("Error deleting user:", e);
        alert(`Error deleting user: ${e.message}`);
      }
    }
  };

  const handleUpdateUser = async (userId: string, data: UserFormInputs) => {
    try {
      // Prepare data for the backend, mapping isActive back to status
      const dataToSend = {
        name: data.name,
        email: data.email,
        status: data.isActive ? "active" : "inactive", // Map isActive back to status
      };

      // Use absolute URL
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        //
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      // If update is successful, update the local state with the new data
      setUsers((prevUsers) =>
        prevUsers.map(
          (u) =>
            u.id === userId
              ? { ...u, ...data, lastLogin: new Date().toISOString() }
              : u // Update lastLogin for demonstration
        )
      );

      // Important: Update selectedUser so UserDetailPanel reflects the changes immediately
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser((prevSelectedUser) =>
          prevSelectedUser ? { ...prevSelectedUser, ...data } : null
        );
      }
      console.log("User updated successfully:", { userId, ...data });
    } catch (e: any) {
      console.error("Error updating user:", e);
      alert(`Error updating user: ${e.message}`);
    }
  };

  const handleToggleActiveStatus = async (userId: string) => {
    const userToToggle = users.find((user) => user.id === userId);
    if (!userToToggle) return;

    const newStatus = userToToggle.isActive ? "inactive" : "active";

    try {
      // Use absolute URL
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        //
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }), // Only send the status to update
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle user status: ${response.statusText}`);
      }

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
      console.log(`User ${userId} status toggled to ${newStatus}.`);
    } catch (e: any) {
      console.error("Error toggling user status:", e);
      alert(`Error toggling user status: ${e.message}`);
    }
  };

  const handleAddUser = () => {
    alert("Add User functionality will be implemented here!");
    // In a real app, this would typically open a form for adding a new user
  };

  const handleExportUsers = () => {
    alert("Export Users functionality will be implemented here!");
    // In a real app, this might trigger a backend process to generate a CSV
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-ivory font-poppins text-charcoal-gray flex items-center justify-center">
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-soft-ivory font-poppins text-red-600 flex items-center justify-center">
        Error: {error}
      </div>
    );
  }

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

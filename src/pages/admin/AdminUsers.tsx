// src/pages/AdminUsers.tsx
import React, { useState, useMemo, useEffect } from "react";
import { Search, ArrowUpDown } from "lucide-react";

// Import the new components
import UserManagementHeader from "@/components/admincontroluser/UserManagementHeader";
import UserSearchBar from "@/components/admincontroluser/UserSearchBar";
import UserTable from "@/components/admincontroluser/UserTable";
import UserDetailPanel from "@/components/admincontroluser/UserDetailPanel";
import AddUserForm from "@/components/admincontroluser/AddUserForm"; // Import the new form component

// Import shared types and utility functions
import { User, getActiveStatusColor } from "@/types/user";

import { Card } from "@/components/ui/card"; // Still useful for other parts, keep

// Re-declare UserFormInputs type as it's used in onUpdateUser (or import if moved)
type UserFormInputs = {
  name: string;
  email: string;
  isActive: boolean;
};

// Define the type for AddUserForm inputs (should match AddUserForm.tsx's schema)
type AddUserFormInputs = {
  name: string;
  email: string;
  isActive: boolean;
};

// Define your API base URL
const API_BASE_URL = "http://localhost:5000/api";

// --- AdminUsers Component ---
const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("registeredDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // New state for Add User form visibility and loading
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false); // To disable form during submission

  // --- Fetch Users from API on component mount ---
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: User[] = await response.json();

        const mappedUsers: User[] = data.map((dbUser: any) => ({
          id: dbUser.id.toString(),
          name: dbUser.name,
          email: dbUser.email,
          isActive: dbUser.status === "active",
          registeredDate: dbUser.created_at,
          lastLogin: dbUser.last_login || undefined,
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
  }, []);

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
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
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
      const dataToSend = {
        name: data.name,
        email: data.email,
        status: data.isActive ? "active" : "inactive",
      };

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
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
        prevUsers.map((u) =>
          u.id === userId
            ? { ...u, ...data, lastLogin: new Date().toISOString() }
            : u
        )
      );

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
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
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

  // Function to handle adding a new user
  const handleAddNewUser = async (newUserData: AddUserFormInputs) => {
    setIsAddingUser(true); // Set loading state
    try {
      const dataToSend = {
        name: newUserData.name,
        email: newUserData.email,
        status: newUserData.isActive ? "active" : "inactive",
      };

      const response = await fetch(`${API_BASE_URL}/users`, {
        // POST to /api/users
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to add user: ${response.statusText} - ${
            errorData.message || ""
          }`
        );
      }

      const addedUserResponse = await response.json();
      const addedUser: User = {
        id: addedUserResponse.user.id.toString(), // Ensure ID is string
        name: addedUserResponse.user.name,
        email: addedUserResponse.user.email,
        isActive: addedUserResponse.user.status === "active",
        registeredDate: addedUserResponse.user.created_at,
        lastLogin: addedUserResponse.user.last_login || undefined,
      };

      setUsers((prevUsers) => [...prevUsers, addedUser]); // Add new user to state
      setShowAddUserForm(false); // Close the form
      alert("User added successfully!");
      console.log("New user added:", addedUser);
    } catch (e: any) {
      console.error("Error adding new user:", e);
      alert(`Error adding new user: ${e.message}`);
    } finally {
      setIsAddingUser(false); // Reset loading state
    }
  };

  const handleAddUser = () => {
    setShowAddUserForm(true); // Open the Add User form
    // Close other panels if open
    setIsViewingDetails(false);
    setSelectedUser(null);
    setIsEditingDetails(false);
  };

  const handleExportUsers = () => {
    if (filteredAndSortedUsers.length === 0) {
      alert("No users to export.");
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Email",
      "Active Status",
      "Registered Date",
      "Last Login",
    ];

    const csvRows = filteredAndSortedUsers.map((user) => [
      user.id,
      user.name,
      user.email,
      user.isActive ? "Active" : "Inactive",
      new Date(user.registeredDate).toLocaleDateString(),
      user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "N/A",
    ]);

    const csvContent =
      headers.join(",") +
      "\n" +
      csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "users_export.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      alert(
        "Your browser does not support the download attribute. Please copy the data manually."
      );
      window.open(
        "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent)
      );
    }
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
          isViewingDetails || showAddUserForm ? "pr-md-80" : "" // Adjust padding if any modal is open
        }`}
      >
        {/* Page Header */}
        <UserManagementHeader
          onAddUser={handleAddUser} // This now toggles the form
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
          getActiveStatusColor={getActiveStatusColor}
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

      {/* Add New User Form (Modal) */}
      {showAddUserForm && (
        <AddUserForm
          onAddUserSubmit={handleAddNewUser}
          onCancel={() => setShowAddUserForm(false)}
          isLoading={isAddingUser}
        />
      )}
    </div>
  );
};

export default AdminUsers;

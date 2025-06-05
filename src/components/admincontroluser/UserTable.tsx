// src/components/admincontroluser/UserTable.tsx
import React from "react";
import { ArrowUpDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import UserCard from "./UserCard"; // Import the UserCard component

// Import the updated User interface and relevant utility functions
import { User, getActiveStatusColor } from "@/types/user";

interface UserTableProps {
  users: User[];
  sortBy: string;
  sortDirection: "asc" | "desc";
  handleSort: (column: string) => void;
  onViewUserClick: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onToggleActiveStatus: (userId: string) => void;
  // Removed getRoleColor from props as 'role' is no longer part of User
  // getRoleColor: (role: User["role"]) => string;
  getActiveStatusColor: (isActive: boolean) => string;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  sortBy,
  sortDirection,
  handleSort,
  onViewUserClick,
  onDeleteUser,
  onToggleActiveStatus,
  // Removed getRoleColor from destructuring
  getActiveStatusColor,
}) => {
  const getSortIndicator = (column: string) => {
    if (sortBy === column) {
      return sortDirection === "asc" ? " ↑" : " ↓";
    }
    return "";
  };

  return (
    <Card className="bg-white p-0 overflow-hidden">
      {users.length === 0 ? (
        <p className="p-8 text-center text-gray-600">
          No users found matching your criteria.
        </p>
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
                  onClick={() => handleSort("name")}
                >
                  Name {getSortIndicator("name")}
                </th>
                {/* Removed Role header column */}
                {/*
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-deep-indigo transition-colors"
                  onClick={() => handleSort("registeredDate")}
                >
                  Registered Date {getSortIndicator("registeredDate")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onViewDetails={onViewUserClick}
                  onDeleteUser={onDeleteUser}
                  onToggleActiveStatus={onToggleActiveStatus}
                  // Removed getRoleColor from props passed to UserCard
                  getActiveStatusColor={getActiveStatusColor}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default UserTable;

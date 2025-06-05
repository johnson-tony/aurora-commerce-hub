// src/components/admincontroluser/UserManagementHeader.tsx
import React from "react";
import { Download, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming path to your Button component

interface UserManagementHeaderProps {
  onAddUser: () => void;
  onExportUsers: () => void;
}

const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  onAddUser,
  onExportUsers,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-charcoal-gray">
          User Management
        </h1>
        <p className="text-gray-600 mt-1">
          Manage all registered users and their roles.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onAddUser}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add New User
        </Button>
        <Button variant="outline" onClick={onExportUsers}>
          <Download className="w-4 h-4 mr-2" />
          Export Users
        </Button>
      </div>
    </div>
  );
};

export default UserManagementHeader;

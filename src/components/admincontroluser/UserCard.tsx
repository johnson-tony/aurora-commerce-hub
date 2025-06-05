// src/components/admincontroluser/UserCard.tsx
import React from "react";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Re-declare User interface or import it from a shared types file
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  isActive: boolean;
  registeredDate: string;
  lastLogin?: string;
}

interface UserCardProps {
  user: User;
  onViewDetails: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onToggleActiveStatus: (userId: string) => void;
  getRoleColor: (role: User["role"]) => string; // Pass these utility functions as props
  getActiveStatusColor: (isActive: boolean) => string;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onViewDetails,
  onDeleteUser,
  onToggleActiveStatus,
  getRoleColor,
  getActiveStatusColor,
}) => {
  return (
    <tr key={user.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal-gray">
        {user.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-charcoal-gray">
          {user.name}
        </div>
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
          className={`${getActiveStatusColor(
            user.isActive
          )} text-sm px-3 py-1.5`}
          onClick={() => onToggleActiveStatus(user.id)}
          title={user.isActive ? "Deactivate User" : "Activate User"}
        >
          {user.isActive ? "Active" : "Inactive"}
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
            onClick={() => onViewDetails(user)}
            title="View User Details"
          >
            <Eye className="w-5 h-5" />
            <span className="sr-only">View User {user.id}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-coral-pink hover:bg-coral-pink/10"
            onClick={() => onDeleteUser(user.id)}
            title="Delete User"
          >
            <Trash2 className="w-5 h-5" />
            <span className="sr-only">Delete User {user.id}</span>
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default UserCard;

// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  // role: "admin" | "customer"; // Remove this line
  isActive: boolean;
  registeredDate: string;
  lastLogin?: string; // Optional
}

// Remove or update getRoleColor as it's no longer relevant without a role
export const getActiveStatusColor = (isActive: boolean): string => {
  return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
};

// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  isActive: boolean;
  registeredDate: string;
  lastLogin?: string; // Optional
}

export const getRoleColor = (role: User["role"]): string => {
  return role === "admin"
    ? "bg-purple-100 text-purple-800"
    : "bg-blue-100 text-blue-800";
};

export const getActiveStatusColor = (isActive: boolean): string => {
  return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
};

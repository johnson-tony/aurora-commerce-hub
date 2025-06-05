// src/components/admincontroluser/UserSearchBar.tsx
import React from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card"; // Assuming path to your Card component
import { Input } from "@/components/ui/input"; // Assuming path to your Input component

interface UserSearchBarProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const UserSearchBar: React.FC<UserSearchBarProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <Card className="p-6 mb-6 bg-white flex flex-col sm:flex-row items-center gap-4">
      <div className="relative flex-1 w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search users by name, email, role..."
          className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-deep-indigo focus:border-deep-indigo"
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>
    </Card>
  );
};

export default UserSearchBar;

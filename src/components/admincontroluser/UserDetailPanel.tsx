// src/components/admincontroluser/UserDetailPanel.tsx
import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, getRoleColor, getActiveStatusColor } from "@/types/user"; // Assuming you create a types file

// Zod Schema for User Form Validation (moved here as it's directly related to the panel)
const userFormSchema = z.object({
  name: z.string().min(1, { message: "User name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  role: z.enum(["admin", "customer"], {
    errorMap: () => ({ message: "Invalid role" }),
  }),
  isActive: z.boolean(),
});

type UserFormInputs = z.infer<typeof userFormSchema>;

interface UserDetailPanelProps {
  selectedUser: User | null;
  isViewingDetails: boolean;
  isEditingDetails: boolean;
  handleCloseDetails: () => void;
  setIsEditingDetails: (isEditing: boolean) => void;
  onUpdateUser: (userId: string, data: UserFormInputs) => void; // Callback to update user in parent
}

const UserDetailPanel: React.FC<UserDetailPanelProps> = ({
  selectedUser,
  isViewingDetails,
  isEditingDetails,
  handleCloseDetails,
  setIsEditingDetails,
  onUpdateUser,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UserFormInputs>({
    resolver: zodResolver(userFormSchema),
  });

  // Effect to update the form when a new user is selected or edit mode changes
  useEffect(() => {
    if (selectedUser) {
      reset({
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        isActive: selectedUser.isActive,
      });
      // Ensure the form is correctly populated for the current state (view/edit)
    } else {
      reset(); // Clear form when no user is selected
    }
  }, [selectedUser, reset, isEditingDetails]);

  const onSubmit: SubmitHandler<UserFormInputs> = (data) => {
    if (selectedUser) {
      onUpdateUser(selectedUser.id, data);
      setIsEditingDetails(false); // Exit edit mode after saving
    }
  };

  if (!isViewingDetails || !selectedUser) {
    return null; // Don't render if not viewing or no user selected
  }

  return (
    <div
      className={`fixed inset-y-0 right-0 z-40 w-full max-w-md bg-white shadow-lg flex flex-col transform transition-transform duration-300
        ${isViewingDetails ? "translate-x-0" : "translate-x-full"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-2xl font-bold text-charcoal-gray">
          User: {selectedUser.name}
        </h2>
        <Button variant="ghost" size="icon" onClick={handleCloseDetails}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-x"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* User Name */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="flex items-center text-charcoal-gray"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-user w-4 h-4 mr-2"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>{" "}
              User Name
            </Label>
            {isEditingDetails ? (
              <>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </>
            ) : (
              <p className="text-lg font-medium text-gray-800">
                {selectedUser.name}
              </p>
            )}
          </div>

          {/* User Email */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="flex items-center text-charcoal-gray"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-mail w-4 h-4 mr-2"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>{" "}
              User Email
            </Label>
            {isEditingDetails ? (
              <>
                <Input id="email" {...register("email")} />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </>
            ) : (
              <p className="text-lg font-medium text-gray-800">
                {selectedUser.email}
              </p>
            )}
          </div>

          {/* User Role */}
          <div className="space-y-2">
            <Label
              htmlFor="role"
              className="flex items-center text-charcoal-gray"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-shield w-4 h-4 mr-2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              </svg>{" "}
              User Role
            </Label>
            {isEditingDetails ? (
              <>
                <Select
                  onValueChange={(value: User["role"]) =>
                    setValue("role", value)
                  }
                  defaultValue={selectedUser.role}
                >
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
              <Badge
                className={
                  getRoleColor(selectedUser.role) + " text-lg px-3 py-1.5"
                }
              >
                {selectedUser.role.charAt(0).toUpperCase() +
                  selectedUser.role.slice(1)}
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
                  {...register("isActive")}
                  className="h-4 w-4 text-deep-indigo focus:ring-deep-indigo border-gray-300 rounded"
                />
                <Label htmlFor="isActive" className="text-charcoal-gray">
                  Is Active
                </Label>
              </>
            ) : (
              <div className="flex items-center">
                <span className="font-medium">Status:</span>
                <Badge
                  className={`ml-2 ${getActiveStatusColor(
                    selectedUser.isActive
                  )}`}
                >
                  {selectedUser.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            )}
          </div>

          {/* Read-only User Details */}
          <h3 className="text-xl font-semibold text-charcoal-gray mt-8 mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-info w-5 h-5 mr-2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>{" "}
            Additional Info
          </h3>
          <div className="space-y-4 text-gray-700">
            <div className="flex items-center justify-between">
              <span className="font-medium">Registered:</span>
              <span>
                {new Date(selectedUser.registeredDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Last Login:</span>
              <span>
                {selectedUser.lastLogin
                  ? new Date(selectedUser.lastLogin).toLocaleString()
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">User ID:</span>
              <span>{selectedUser.id}</span>
            </div>
          </div>

          {/* Actions for Edit Mode */}
          {isEditingDetails && (
            <div className="flex justify-end space-x-2 mt-8">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsEditingDetails(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-save w-4 h-4 mr-2"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
                  <path d="M17 21v-8H7v8" />
                  <path d="M7 3v4h4" />
                </svg>{" "}
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Footer actions (Edit button) */}
      {!isEditingDetails && (
        <div className="p-6 border-t flex justify-end">
          <Button onClick={() => setIsEditingDetails(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-edit w-4 h-4 mr-2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.37 2.63a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
            </svg>{" "}
            Edit User
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserDetailPanel;

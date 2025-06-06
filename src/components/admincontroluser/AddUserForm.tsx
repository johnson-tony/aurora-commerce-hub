// src/components/admincontroluser/AddUserForm.tsx
import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form"; // Import Controller
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Assuming you have a Switch component for isActive

// Zod Schema for New User Form Validation
const addUserFormSchema = z.object({
  // Corrected variable name here
  name: z.string().min(1, { message: "User name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  isActive: z.boolean().default(true), // Default to true for new users
});

// Corrected type inference here:
type AddUserFormInputs = z.infer<typeof addUserFormSchema>; // Corrected variable name

interface AddUserFormProps {
  onAddUserSubmit: (data: AddUserFormInputs) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const AddUserForm: React.FC<AddUserFormProps> = ({
  onAddUserSubmit,
  onCancel,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control, // Needed for controlled components like Switch
  } = useForm<AddUserFormInputs>({
    resolver: zodResolver(addUserFormSchema), // Corrected variable name here
    defaultValues: {
      isActive: true, // Set default value for the switch
    },
  });

  const onSubmit: SubmitHandler<AddUserFormInputs> = (data) => {
    onAddUserSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <h2 className="text-2xl font-bold mb-6 text-charcoal-gray">
          Add New User
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="addName">Name</Label>
            <Input id="addName" {...register("name")} disabled={isLoading} />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="addEmail">Email</Label>
            <Input id="addEmail" {...register("email")} disabled={isLoading} />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Label htmlFor="addIsActive">Active Status</Label>
            {/* Using shadcn/ui Switch with react-hook-form Controller */}
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch
                  id="addIsActive"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              )}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm;

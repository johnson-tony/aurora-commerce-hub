import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; // Removed CardHeader and CardTitle as they weren't used
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: number;
  name: string;
  image: string;
  display_order: number; // Changed from 'order' to 'display_order' to match backend
}

const API_BASE_URL = "http://localhost:5000/api/admin"; // Your backend server URL

const AdminCategories = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", image: "" });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // --- Fetch Categories ---
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Category[] = await response.json();
      setCategories(data);
    } catch (error: any) {
      toast({
        title: "Error fetching categories",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // --- Image Handling ---
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For a real application, you'd upload this file to a storage service (e.g., Cloudinary, S3)
      // and get a URL back. For this example, we're simulating with Data URL.
      // In a production setup, you'd send the file to your backend which then saves it and returns a URL.
      // For now, we'll just use a placeholder or data URL for display.
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImagePreview(imageUrl);
        setFormData((prev) => ({ ...prev, image: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImagePreview(imageUrl);
        setFormData((prev) => ({ ...prev, image: imageUrl }));
      };
      reader.readAsDataURL(files[0]);
    }
  };

  // --- Form Submission (Create/Update) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.image) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingCategory) {
        // Update Category
        const response = await fetch(
          `${API_BASE_URL}/categories/${editingCategory.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: formData.name,
              image: formData.image,
              order: editingCategory.display_order,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        await response.json(); // Consume the response body

        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingCategory.id
              ? { ...cat, name: formData.name, image: formData.image }
              : cat
          )
        );
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        // Create New Category
        const response = await fetch(`${API_BASE_URL}/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const newCategory: Category = await response.json(); // Backend returns the new category with ID and order

        setCategories((prev) => [...prev, newCategory]);
        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }
      resetForm();
      fetchCategories(); // Re-fetch to ensure order is correct after creation/update
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to save category: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", image: "" });
    setImagePreview("");
    setEditingCategory(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, image: category.image });
    setImagePreview(category.image);
    setIsDialogOpen(true);
  };

  // --- Delete Category ---
  const handleDelete = async (categoryId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await response.json(); // Consume the response body

      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      toast({ title: "Success", description: "Category deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete category: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // --- Drag & Drop Reordering ---
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    // After drag ends, save the new order to the backend
    updateCategoryOrder();
  };

  const handleCardDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) {
      return;
    }

    const newCategories = [...categories];
    const draggedItem = newCategories[draggedIndex];
    newCategories.splice(draggedIndex, 1);
    newCategories.splice(index, 0, draggedItem);

    // Update local state for immediate visual feedback
    setCategories(newCategories);
    setDraggedIndex(index); // Update the dragged index to reflect the new position
  };

  const updateCategoryOrder = async () => {
    // Map the current state to the format expected by the backend
    const orderedCategories = categories.map((cat, index) => ({
      id: cat.id,
      order: index + 1, // Assign new sequential order based on current array index
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/categories/reorder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categories: orderedCategories }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      toast({
        title: "Success",
        description: "Categories reordered successfully",
      });
      fetchCategories(); // Re-fetch to ensure consistency with backend
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to reorder categories: ${error.message}`,
        variant: "destructive",
      });
      fetchCategories(); // Re-fetch to revert to backend state if reorder fails
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F9F6F2" }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#333" }}>
              Category Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage product categories with drag & drop functionality
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="text-white font-medium px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  backgroundColor: "#4B0082",
                  borderColor: "#4B0082",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#FF6B6B")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#4B0082")
                }
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md mx-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle style={{ color: "#333" }}>
                  {editingCategory ? "Edit Category" : "Create New Category"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label
                    htmlFor="categoryName"
                    className="text-sm font-medium"
                    style={{ color: "#333" }}
                  >
                    Category Name
                  </Label>
                  <Input
                    id="categoryName"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter category name"
                    className="mt-2 rounded-xl border-gray-300 focus:ring-2"
                    style={
                      { "--tw-ring-color": "#4B0082" } as React.CSSProperties
                    }
                  />
                </div>

                <div>
                  <Label
                    className="text-sm font-medium"
                    style={{ color: "#333" }}
                  >
                    Category Image
                  </Label>

                  <div
                    className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() =>
                      document.getElementById("imageInput")?.click()
                    }
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImagePreview("");
                            setFormData((prev) => ({ ...prev, image: "" }));
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-12 h-12 mx-auto text-gray-400" />
                        <div>
                          <p className="text-gray-600">
                            Drag & drop an image here, or click to browse
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            PNG, JPG up to 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 text-white rounded-xl"
                    style={{ backgroundColor: "#4B0082" }}
                  >
                    {editingCategory ? "Update" : "Create"} Category
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Card
              key={category.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleCardDragOver(e, index)}
              className="group cursor-move bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden"
              style={{
                transform: draggedIndex === index ? "rotate(5deg)" : "none",
                opacity: draggedIndex === index ? 0.8 : 1,
              }}
            >
              <div className="relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
              </div>

              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: "#333" }}
                  >
                    {category.name}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(category)}
                      className="p-2 rounded-xl border-gray-300 hover:border-blue-500 hover:text-blue-500 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(category.id)}
                      className="p-2 rounded-xl border-gray-300 hover:border-red-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: "#333" }}
            >
              No categories yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first category to get started
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="text-white px-6 py-3 rounded-2xl"
              style={{ backgroundColor: "#4B0082" }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Category
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;

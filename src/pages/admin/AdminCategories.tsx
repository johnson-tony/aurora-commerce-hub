import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

// --- Interfaces ---
interface SubCategory {
  id: number;
  name: string;
  image: string;
  display_order: number;
  parent_id: number; // Link to parent category
}

interface Category {
  id: number;
  name: string;
  image: string;
  display_order: number;
  subcategories?: SubCategory[]; // Optional array of subcategories
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

  // --- Subcategory States ---
  // Changed to a Set to store IDs of open categories
  const [openCategoryIds, setOpenCategoryIds] = useState<Set<number>>(
    new Set()
  );
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] =
    useState<SubCategory | null>(null);
  const [subcategoriesFormData, setSubcategoriesFormData] = useState({
    name: "",
    image: "",
  });
  const [subcategoryImagePreview, setSubcategoryImagePreview] =
    useState<string>("");
  const [draggedSubcategoryIndex, setDraggedSubcategoryIndex] = useState<
    number | null
  >(null);

  // --- Fetch Categories ---
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Category[] = await response.json();
      // Initialize categories with subcategories array, even if empty
      setCategories(
        data.map((cat) => ({ ...cat, subcategories: cat.subcategories || [] }))
      );
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

  // --- Fetch Subcategories ---
  const fetchSubcategories = useCallback(
    async (categoryId: number) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/categories/${categoryId}/subcategories`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: SubCategory[] = await response.json();
        // Update the specific category with its subcategories
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === categoryId ? { ...cat, subcategories: data } : cat
          )
        );
      } catch (error: any) {
        toast({
          title: "Error fetching subcategories",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // --- Image Handling (for Categories) ---
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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

  // --- Form Submission (Create/Update Category) ---
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
              display_order: editingCategory.display_order,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        await response.json();

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
        const newCategory: Category = await response.json();

        setCategories((prev) => [
          ...prev,
          { ...newCategory, subcategories: [] },
        ]); // Ensure new category has subcategories array
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
      await response.json();

      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      // Also remove from openCategoryIds if it was open
      setOpenCategoryIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(categoryId);
        return newSet;
      });
      toast({ title: "Success", description: "Category deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete category: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // --- Drag & Drop Reordering (Categories) ---
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
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

    setCategories(newCategories);
    setDraggedIndex(index);
  };

  const updateCategoryOrder = async () => {
    const orderedCategories = categories.map((cat, index) => ({
      id: cat.id,
      order: index + 1,
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
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to reorder categories: ${error.message}`,
        variant: "destructive",
      });
      fetchCategories();
    }
  };

  // --- Subcategory Image Handling ---
  const handleSubcategoryImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setSubcategoryImagePreview(imageUrl);
        setSubcategoriesFormData((prev) => ({ ...prev, image: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubcategoryDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubcategoryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setSubcategoryImagePreview(imageUrl);
        setSubcategoriesFormData((prev) => ({ ...prev, image: imageUrl }));
      };
      reader.readAsDataURL(files[0]);
    }
  };

  // --- Form Submission (Create/Update Subcategory) ---
  const handleSubcategorySubmit = async (
    e: React.FormEvent,
    parentCategoryId: number
  ) => {
    e.preventDefault();

    if (!subcategoriesFormData.name.trim() || !subcategoriesFormData.image) {
      toast({
        title: "Error",
        description: "Please fill all subcategory fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingSubcategory) {
        // Update Subcategory
        const response = await fetch(
          `${API_BASE_URL}/subcategories/${editingSubcategory.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: subcategoriesFormData.name,
              image: subcategoriesFormData.image,
              display_order: editingSubcategory.display_order,
              parent_id: parentCategoryId, // Ensure parent_id is sent
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        await response.json();

        setCategories((prevCategories) =>
          prevCategories.map((cat) =>
            cat.id === parentCategoryId
              ? {
                  ...cat,
                  subcategories:
                    cat.subcategories?.map((subcat) =>
                      subcat.id === editingSubcategory.id
                        ? {
                            ...subcat,
                            name: subcategoriesFormData.name,
                            image: subcategoriesFormData.image,
                          }
                        : subcat
                    ) || [],
                }
              : cat
          )
        );

        toast({
          title: "Success",
          description: "Subcategory updated successfully",
        });
      } else {
        // Create New Subcategory
        const response = await fetch(
          `${API_BASE_URL}/categories/${parentCategoryId}/subcategories`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(subcategoriesFormData),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const newSubcategory: SubCategory = await response.json();

        setCategories((prevCategories) =>
          prevCategories.map((cat) =>
            cat.id === parentCategoryId
              ? {
                  ...cat,
                  subcategories: [...(cat.subcategories || []), newSubcategory],
                }
              : cat
          )
        );
        toast({
          title: "Success",
          description: "Subcategory created successfully",
        });
      }
      resetSubcategoryForm();
      fetchSubcategories(parentCategoryId); // Re-fetch subcategories for the selected category
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to save subcategory: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const resetSubcategoryForm = () => {
    setSubcategoriesFormData({ name: "", image: "" });
    setSubcategoryImagePreview("");
    setEditingSubcategory(null);
    setIsSubcategoryDialogOpen(false);
  };

  const handleEditSubcategory = (subcategory: SubCategory) => {
    setEditingSubcategory(subcategory);
    setSubcategoriesFormData({
      name: subcategory.name,
      image: subcategory.image,
    });
    setSubcategoryImagePreview(subcategory.image);
    setIsSubcategoryDialogOpen(true);
  };

  // --- Delete Subcategory ---
  const handleDeleteSubcategory = async (
    subcategoryId: number,
    parentCategoryId: number
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/subcategories/${subcategoryId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await response.json();

      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === parentCategoryId
            ? {
                ...cat,
                subcategories: cat.subcategories?.filter(
                  (subcat) => subcat.id !== subcategoryId
                ),
              }
            : cat
        )
      );
      toast({
        title: "Success",
        description: "Subcategory deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete subcategory: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // --- Drag & Drop Reordering (Subcategories) ---
  const handleDragStartSubcategory = (index: number) => {
    setDraggedSubcategoryIndex(index);
  };

  const handleDragEndSubcategory = (parentCategoryId: number) => {
    setDraggedSubcategoryIndex(null);
    updateSubcategoryOrder(parentCategoryId);
  };

  const handleSubcategoryCardDragOver = (
    e: React.DragEvent,
    index: number,
    parentCategoryId: number
  ) => {
    e.preventDefault();
    if (draggedSubcategoryIndex === null) {
      return;
    }

    setCategories((prevCategories) =>
      prevCategories.map((cat) => {
        if (cat.id === parentCategoryId && cat.subcategories) {
          const newSubcategories = [...cat.subcategories];
          const draggedItem = newSubcategories[draggedSubcategoryIndex];
          // Prevent dragging onto itself or outside bounds
          if (
            draggedSubcategoryIndex === index ||
            index < 0 ||
            index >= newSubcategories.length
          ) {
            return cat;
          }
          newSubcategories.splice(draggedSubcategoryIndex, 1);
          newSubcategories.splice(index, 0, draggedItem);

          // Update the dragged index to reflect the new position
          // This is crucial for correct subsequent dragOver events
          setDraggedSubcategoryIndex(newSubcategories.indexOf(draggedItem));
          return { ...cat, subcategories: newSubcategories };
        }
        return cat;
      })
    );
  };

  const updateSubcategoryOrder = async (parentCategoryId: number) => {
    const parentCategory = categories.find(
      (cat) => cat.id === parentCategoryId
    );
    if (!parentCategory || !parentCategory.subcategories) return;

    const orderedSubcategories = parentCategory.subcategories.map(
      (subcat, index) => ({
        id: subcat.id,
        order: index + 1,
      })
    );

    try {
      const response = await fetch(
        `${API_BASE_URL}/categories/${parentCategoryId}/subcategories/reorder`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subcategories: orderedSubcategories }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      toast({
        title: "Success",
        description: "Subcategories reordered successfully",
      });
      fetchSubcategories(parentCategoryId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to reorder subcategories: ${error.message}`,
        variant: "destructive",
      });
      fetchSubcategories(parentCategoryId); // Re-fetch to revert to backend state if reorder fails
    }
  };

  // --- Toggle Subcategories Visibility ---
  const toggleSubcategories = useCallback(
    (categoryId: number) => {
      setOpenCategoryIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(categoryId)) {
          newSet.delete(categoryId); // Close if already open
        } else {
          newSet.add(categoryId); // Open if closed
          // Only fetch subcategories if they haven't been fetched or need a refresh
          const category = categories.find((cat) => cat.id === categoryId);
          if (
            (category && !category.subcategories) ||
            category.subcategories?.length === 0
          ) {
            fetchSubcategories(categoryId);
          }
        }
        return newSet;
      });
    },
    [categories, fetchSubcategories]
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F9F6F2" }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#333" }}>
              Category Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage product categories and their subcategories
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
          {categories.map((category, index) => {
            const isCategoryOpen = openCategoryIds.has(category.id); // Check if this specific category is open

            return (
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleSubcategories(category.id)} // Use the new toggle function
                        className="p-2 rounded-xl border-gray-300 hover:border-purple-500 hover:text-purple-500 transition-colors"
                      >
                        {isCategoryOpen ? ( // Check if this specific category is open
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Subcategories Section (conditionally rendered based on its own open state) */}
                  {isCategoryOpen && (
                    <div className="mt-6 border-t pt-4">
                      <h4
                        className="text-md font-semibold mb-3"
                        style={{ color: "#333" }}
                      >
                        Subcategories
                      </h4>
                      <Dialog
                        open={isSubcategoryDialogOpen}
                        onOpenChange={setIsSubcategoryDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="w-full text-white font-medium mb-4 rounded-xl"
                            style={{ backgroundColor: "#8A2BE2" }}
                            onClick={() => {
                              resetSubcategoryForm();
                              setIsSubcategoryDialogOpen(true);
                              // Ensure correct parent ID is passed when adding a new subcategory
                              // We can set a temporary state if needed, or pass it directly to submit handler
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" /> Add Subcategory
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-md mx-auto rounded-2xl">
                          <DialogHeader>
                            <DialogTitle style={{ color: "#333" }}>
                              {editingSubcategory
                                ? "Edit Subcategory"
                                : "Create New Subcategory"}
                            </DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={(e) =>
                              handleSubcategorySubmit(e, category.id)
                            }
                            className="space-y-6"
                          >
                            <div>
                              <Label
                                htmlFor="subcategoryName"
                                className="text-sm font-medium"
                                style={{ color: "#333" }}
                              >
                                Subcategory Name
                              </Label>
                              <Input
                                id="subcategoryName"
                                value={subcategoriesFormData.name}
                                onChange={(e) =>
                                  setSubcategoriesFormData((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }
                                placeholder="Enter subcategory name"
                                className="mt-2 rounded-xl border-gray-300 focus:ring-2"
                                style={
                                  {
                                    "--tw-ring-color": "#8A2BE2",
                                  } as React.CSSProperties
                                }
                              />
                            </div>
                            <div>
                              <Label
                                className="text-sm font-medium"
                                style={{ color: "#333" }}
                              >
                                Subcategory Image
                              </Label>
                              <div
                                className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                                onDragOver={handleSubcategoryDragOver}
                                onDrop={handleSubcategoryDrop}
                                onClick={() =>
                                  document
                                    .getElementById("subcategoryImageInput")
                                    ?.click()
                                }
                              >
                                {subcategoryImagePreview ? (
                                  <div className="relative">
                                    <img
                                      src={subcategoryImagePreview}
                                      alt="Preview"
                                      className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSubcategoryImagePreview("");
                                        setSubcategoriesFormData((prev) => ({
                                          ...prev,
                                          image: "",
                                        }));
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
                                        Drag & drop an image here, or click to
                                        browse
                                      </p>
                                      <p className="text-sm text-gray-500 mt-1">
                                        PNG, JPG up to 10MB
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <input
                                id="subcategoryImageInput"
                                type="file"
                                accept="image/*"
                                onChange={handleSubcategoryImageUpload}
                                className="hidden"
                              />
                            </div>
                            <div className="flex gap-3 pt-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={resetSubcategoryForm}
                                className="flex-1 rounded-xl"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                className="flex-1 text-white rounded-xl"
                                style={{ backgroundColor: "#8A2BE2" }}
                              >
                                {editingSubcategory ? "Update" : "Create"}{" "}
                                Subcategory
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>

                      {category.subcategories &&
                      category.subcategories.length > 0 ? (
                        <div className="space-y-3">
                          {category.subcategories.map((subcat, subIndex) => (
                            <Card
                              key={subcat.id}
                              draggable
                              onDragStart={() =>
                                handleDragStartSubcategory(subIndex)
                              }
                              onDragEnd={() =>
                                handleDragEndSubcategory(category.id)
                              } // Pass parent ID here
                              onDragOver={(e) =>
                                handleSubcategoryCardDragOver(
                                  e,
                                  subIndex,
                                  category.id
                                )
                              }
                              className="flex items-center justify-between p-3 border rounded-xl bg-gray-50 cursor-move"
                              style={{
                                transform:
                                  draggedSubcategoryIndex === subIndex &&
                                  isCategoryOpen
                                    ? "rotate(2deg)"
                                    : "none",
                                opacity:
                                  draggedSubcategoryIndex === subIndex &&
                                  isCategoryOpen
                                    ? 0.8
                                    : 1,
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={subcat.image}
                                  alt={subcat.name}
                                  className="w-10 h-10 object-cover rounded-md"
                                />
                                <span className="font-medium text-gray-700">
                                  {subcat.name}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditSubcategory(subcat)}
                                  className="p-1 rounded-lg hover:border-blue-500 hover:text-blue-500"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleDeleteSubcategory(
                                      subcat.id,
                                      category.id
                                    )
                                  }
                                  className="p-1 rounded-lg hover:border-red-500 hover:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm italic">
                          No subcategories for this category yet.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
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

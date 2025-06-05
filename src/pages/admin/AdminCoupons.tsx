import React, { useState, useEffect, useCallback } from "react";
import { PlusCircle, Download, Search, Filter } from "lucide-react";

// AdminLayout import removed as per your request
// import AdminLayout from "@/layouts/AdminLayout"; 

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Make sure these import paths are correct relative to AdminCoupons.js
import CouponForm, { CouponFormInputs } from "./form/CouponForm";
import CouponList from "@/components/adminsidecoupen/CouponList";

// Removed: const API_BASE_URL = "http://localhost:5000/api/admin";

// Interface for coupon data fetched from the backend
interface CouponDisplayData {
  id: string;
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed_amount" | "free_shipping";
  discount_value: number;
  minimum_spend?: number;
  usage_limit_per_coupon?: number;
  usage_limit_per_customer?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminCoupons = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | undefined>(
    undefined
  );
  const [coupons, setCoupons] = useState<CouponDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Changed to direct URL
      const response = await fetch("http://localhost:5000/api/admin/coupons");
      if (!response.ok) {
        const errorBody = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(
          `HTTP error! status: ${response.status} - ${
            errorBody.message || response.statusText
          }`
        );
      }
      const data: CouponDisplayData[] = await response.json();

      const processedData = data.map((coupon) => ({
        ...coupon,
        is_active: Boolean(coupon.is_active),
      }));
      setCoupons(processedData);
    } catch (err: any) {
      console.error("Failed to fetch coupons:", err);
      setError(
        `Failed to load coupons: ${
          err.message || "Please check your network and backend server."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Modified handleExportCoupons
  const handleExportCoupons = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Direct URL for export endpoint
      const response = await fetch(
        "http://localhost:5000/api/admin/coupons/export"
      );

      if (!response.ok) {
        const errorBody = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(
          `HTTP error! status: ${response.status} - ${
            errorBody.message || response.statusText
          }`
        );
      }

      // Get the blob (file content) from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const a = document.createElement("a");
      a.href = url;

      // Get filename from Content-Disposition header if available, otherwise default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "coupons_export.csv"; // Default filename
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      a.download = filename; // Set the download filename
      document.body.appendChild(a); // Append to body (required for Firefox)
      a.click(); // Programmatically click the link to trigger download
      a.remove(); // Clean up the temporary link
      window.URL.revokeObjectURL(url); // Release the object URL

      alert("Coupons exported successfully!");
    } catch (err: any) {
      console.error("Failed to export coupons:", err);
      setError(
        `Failed to export coupons: ${
          err.message || "Please check your network and backend server."
        }`
      );
      alert(
        `Error exporting coupons: ${
          err.message || "An unexpected error occurred during export."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ... (rest of your component code) ...

  const handleOpenCreateModal = () => {
    setEditingCouponId(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (couponId: string) => {
    setEditingCouponId(couponId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCouponId(undefined);
    fetchCoupons();
  };

  const mapFormInputsToApiData = (
    formData: CouponFormInputs
  ): Omit<CouponDisplayData, "id" | "created_at" | "updated_at"> => {
    return {
      code: formData.code,
      description: formData.description || undefined,
      discount_type: formData.discountType,
      discount_value: formData.discountValue,
      minimum_spend:
        formData.minimumSpend === "" ? undefined : formData.minimumSpend,
      usage_limit_per_coupon:
        formData.usageLimitPerCoupon === ""
          ? undefined
          : formData.usageLimitPerCoupon,
      usage_limit_per_customer:
        formData.usageLimitPerCustomer === ""
          ? undefined
          : formData.usageLimitPerCustomer,
      start_date: formData.startDate,
      end_date: formData.endDate,
      is_active: formData.isActive,
    };
  };

  const handleCouponSaved = async (savedData: CouponFormInputs) => {
    setIsLoading(true);
    setError(null);
    try {
      const dataToSend = mapFormInputsToApiData(savedData);
      let response;
      let method;
      let url;

      if (editingCouponId) {
        // Changed to direct URL with template literal
        url = `http://localhost:5000/api/admin/coupons/${editingCouponId}`;
        method = "PUT";
      } else {
        // Changed to direct URL
        url = `http://localhost:5000/api/admin/coupons`;
        method = "POST";
      }

      response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to ${editingCouponId ? "update" : "create"} coupon.`
        );
      }

      handleModalClose();
      alert(
        `Coupon "${savedData.code}" ${
          editingCouponId ? "updated" : "created"
        } successfully!`
      );
    } catch (err: any) {
      console.error("Error saving coupon:", err);
      setError(`Error saving coupon: ${err.message}`);
      alert(`Error saving coupon: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (
      window.confirm(`Are you sure you want to delete coupon ID: ${couponId}?`)
    ) {
      setIsLoading(true);
      setError(null);
      try {
        // Changed to direct URL with template literal
        const response = await fetch(
          `http://localhost:5000/api/admin/coupons/${couponId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete coupon.");
        }

        setCoupons((prevCoupons) =>
          prevCoupons.filter((coupon) => coupon.id !== couponId)
        );
        alert(`Coupon ${couponId} deleted successfully!`);
      } catch (err: any) {
        console.error("Error deleting coupon:", err);
        setError(`Error deleting coupon: ${err.message}`);
        alert(`Error deleting coupon: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      searchTerm === "" ||
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coupon.description &&
        coupon.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const startDate = new Date(coupon.start_date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(coupon.end_date);
    endDate.setHours(23, 59, 59, 999);

    let currentStatus = "";
    if (!coupon.is_active) {
      currentStatus = "disabled";
    } else if (now < startDate) {
      currentStatus = "upcoming";
    } else if (now > endDate) {
      currentStatus = "expired";
    } else {
      currentStatus = "active";
    }

    const matchesStatus =
      filterStatus === "all" || currentStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-charcoal-gray">
            Coupon Management
          </h1>
          <p className="text-gray-600 mt-1">
            Create, manage, and track discount codes for your customers.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportCoupons}
            disabled={isLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Coupons
          </Button>

          {/* Dialog/Modal for Add/Edit Coupon */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreateModal} disabled={isLoading}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add New Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCouponId ? "Edit Coupon" : "Create New Coupon"}
                </DialogTitle>
              </DialogHeader>
              <CouponForm
                couponId={editingCouponId}
                onSave={handleCouponSaved}
                onCancel={handleModalClose}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card className="p-6 mb-6 bg-white flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search coupons by code, description..."
            className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-deep-indigo focus:border-deep-indigo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="relative w-full sm:max-w-[180px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full pl-10">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="text-center text-blue-500 py-4">
          <p>Loading coupons, please wait...</p>
        </div>
      )}
      {error && (
        <div className="text-center text-red-500 py-4">
          <p>{error}</p>
          <Button onClick={fetchCoupons} className="mt-2">
            Retry Loading
          </Button>
        </div>
      )}

      {/* Coupon Table/List */}
      <Card className="bg-white p-8">
        <h2 className="text-2xl font-semibold text-charcoal-gray mb-4">
          Your Coupon List
        </h2>

        {!isLoading && !error && filteredCoupons.length > 0 ? (
          <CouponList
            coupons={filteredCoupons}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteCoupon}
          />
        ) : (
          !isLoading &&
          !error && (
            <p className="text-gray-700">
              No coupons found matching your criteria.
            </p>
          )
        )}
      </Card>
    </div>
  );
};

export default AdminCoupons;
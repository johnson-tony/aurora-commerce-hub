import React, { useState, useEffect } from 'react';
import { PlusCircle, Download, Search, Filter, Edit, Trash2 } from 'lucide-react';

import AdminLayout from '@/layouts/AdminLayout'; // Your admin layout
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Shadcn UI Dialog components for the modal
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Corrected import path for CouponForm
import CouponForm, { CouponFormInputs } from './form/CouponForm';

// --- Dummy Data for Coupon List (Only two examples as requested) ---
interface CouponDisplayData {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_shipping';
  discountValue: number;
  minimumSpend?: number; // Here, it's just 'number | undefined'
  usageLimitPerCoupon?: number; // Here, it's just 'number | undefined'
  usageLimitPerCustomer?: number; // Here, it's just 'number | undefined'
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const INITIAL_COUPONS_DATA: CouponDisplayData[] = [
  {
    id: 'coupon_abc_123',
    code: 'SAVEBIG20',
    description: '20% off for new customers',
    discountType: 'percentage',
    discountValue: 20,
    minimumSpend: 50,
    usageLimitPerCoupon: 100,
    usageLimitPerCustomer: 1,
    startDate: '2025-06-01',
    endDate: '2025-12-31',
    isActive: true,
  },
  {
    id: 'coupon_xyz_456',
    code: 'FREESHIP',
    description: 'Free shipping on all orders',
    discountType: 'free_shipping',
    discountValue: 0,
    minimumSpend: undefined, // Simulating unlimited
    usageLimitPerCoupon: undefined, // Simulating unlimited
    usageLimitPerCustomer: 1,
    startDate: '2025-05-15',
    endDate: '2025-07-31',
    isActive: true,
  },
];


const AdminCoupons = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | undefined>(undefined);
  const [coupons, setCoupons] = useState<CouponDisplayData[]>([]); // State to manage the list of coupons

  // Simulate fetching data on component mount
  useEffect(() => {
    // In a real application, you'd fetch this from your backend:
    // fetch('/api/admin/coupons').then(res => res.json()).then(data => setCoupons(data));
    setCoupons(INITIAL_COUPONS_DATA);
  }, []);


  const handleExportCoupons = () => {
    console.log("Exporting coupons...");
    // Implement actual export logic here
    alert("Functionality to export coupons will go here!");
  };

  const handleOpenCreateModal = () => {
    setEditingCouponId(undefined); // Ensures the form is for creating a new coupon
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (couponId: string) => {
    setEditingCouponId(couponId); // Sets the ID for editing
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCouponId(undefined); // Clear editing ID when modal closes
    // In a real app, you would typically refetch the coupon list here to see the changes
    // setCoupons(await fetchCouponsFromApi());
    console.log("Modal closed. Consider refreshing coupon list data.");
  };

  // NEW HELPER: Maps CouponFormInputs to CouponDisplayData
  // This ensures all required fields are explicitly handled and types match.
  const mapFormInputsToDisplayData = (formData: CouponFormInputs, id: string): CouponDisplayData => {
    return {
      id: id, // ID is added externally for new coupons, or from existing for edits
      code: formData.code,
      description: formData.description,
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      minimumSpend: formData.minimumSpend === '' ? undefined : formData.minimumSpend,
      usageLimitPerCoupon: formData.usageLimitPerCoupon === '' ? undefined : formData.usageLimitPerCoupon,
      usageLimitPerCustomer: formData.usageLimitPerCustomer === '' ? undefined : formData.usageLimitPerCustomer,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: formData.isActive,
    };
  };

  const handleCouponSaved = (savedData: CouponFormInputs) => {
    console.log("Coupon saved in modal:", savedData);

    if (editingCouponId) {
      // For editing, use the existing ID
      const updatedCoupon = mapFormInputsToDisplayData(savedData, editingCouponId);

      setCoupons(prevCoupons =>
        prevCoupons.map(coupon =>
          coupon.id === editingCouponId
            ? updatedCoupon // Use the fully mapped and typed object
            : coupon
        )
      );
      alert(`Coupon "${savedData.code}" updated successfully!`);
    } else {
      // For new coupon, generate a new ID
      const newId = `coupon_${Date.now()}`;
      const newCoupon = mapFormInputsToDisplayData(savedData, newId); // Map with the new ID

      setCoupons(prevCoupons => [...prevCoupons, newCoupon]);
      alert(`Coupon "${savedData.code}" created successfully!`);
    }

    handleModalClose(); // Close the modal after saving
  };

  const handleDeleteCoupon = (couponId: string) => {
    if (window.confirm(`Are you sure you want to delete coupon ID: ${couponId}?`)) {
      console.log(`Deleting coupon: ${couponId}`);
      // In a real application, you'd make an API call to delete the coupon
      // await deleteCouponApi(couponId);
      setCoupons(prevCoupons => prevCoupons.filter(coupon => coupon.id !== couponId));
      alert(`Coupon ${couponId} deleted (simulated).`);
    }
  };

  // Filter coupons based on search term and status
  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = searchTerm === '' ||
                          coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (coupon.description && coupon.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Determine coupon's current status for filtering
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    let currentStatus = '';
    if (!coupon.isActive) {
        currentStatus = 'disabled';
    } else if (now < startDate) {
        currentStatus = 'upcoming';
    } else if (now > endDate) {
        currentStatus = 'expired';
    } else {
        currentStatus = 'active';
    }

    const matchesStatus = filterStatus === 'all' || currentStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-charcoal-gray">Coupon Management</h1>
            <p className="text-gray-600 mt-1">Create, manage, and track discount codes for your customers.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCoupons}>
              <Download className="w-4 h-4 mr-2" />
              Export Coupons
            </Button>

            {/* Dialog/Modal for Add/Edit Coupon */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenCreateModal}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add New Coupon
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto"> {/* Adjust max-w and overflow-y-auto for scrollable content */}
                <DialogHeader>
                  <DialogTitle>{editingCouponId ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
                </DialogHeader>
                {/* Render the CouponForm inside the DialogContent */}
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
            />
          </div>

          <div className="relative w-full sm:max-w-[180px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
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

        {/* Coupon Table/List */}
        <Card className="bg-white p-8">
          <h2 className="text-2xl font-semibold text-charcoal-gray mb-4">Your Coupon List</h2>

          {filteredCoupons.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coupon Code
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage Limit
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCoupons.map((coupon) => {
                    const now = new Date();
                    const startDate = new Date(coupon.startDate);
                    const endDate = new Date(coupon.endDate);

                    let statusText = 'Active';
                    let statusClass = 'bg-green-100 text-green-800';

                    if (!coupon.isActive) {
                      statusText = 'Disabled';
                      statusClass = 'bg-gray-100 text-gray-800';
                    } else if (now < startDate) {
                      statusText = 'Upcoming';
                      statusClass = 'bg-blue-100 text-blue-800';
                    } else if (now > endDate) {
                      statusText = 'Expired';
                      statusClass = 'bg-red-100 text-red-800';
                    }

                    return (
                      <tr key={coupon.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {coupon.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {coupon.discountType.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` :
                          coupon.discountType === 'fixed_amount' ? `₹${coupon.discountValue.toFixed(2)}` :
                          'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {typeof coupon.usageLimitPerCoupon === 'number' ? coupon.usageLimitPerCoupon : 'Unlimited'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coupon.startDate} to {coupon.endDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                            {statusText}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit Coupon"
                            onClick={() => handleOpenEditModal(coupon.id)}
                            className="text-deep-indigo hover:text-indigo-900 mr-4"
                          >
                            <Edit className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Coupon"
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-700">No coupons found matching your criteria.</p>
          )}
        </Card>
      </div>
  
  );
};

export default AdminCoupons;
import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, XCircle, Tag, Percent, IndianRupee, CalendarDays, Hash, Users, Package } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch'; // Assuming you have shadcn/ui Switch component

// --- Zod Schema for Coupon Form Validation ---
const couponFormSchema = z.object({
  code: z.string().min(3, { message: 'Coupon code must be at least 3 characters.' }).max(50, { message: 'Coupon code cannot exceed 50 characters.' }),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed_amount', 'free_shipping'], {
    errorMap: () => ({ message: 'Please select a valid discount type.' }),
  }),
  discountValue: z.preprocess(
    (val) => Number(val),
    z.number().min(0.01, { message: 'Discount value must be positive.' })
  ),
  minimumSpend: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0, { message: 'Minimum spend cannot be negative.' }).optional()
  ).or(z.literal('')), // Allow empty string for optional input
  usageLimitPerCoupon: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().int().min(0, { message: 'Usage limit must be a non-negative integer.' }).optional()
  ).or(z.literal('')),
  usageLimitPerCustomer: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().int().min(0, { message: 'Usage limit per customer must be a non-negative integer.' }).optional()
  ).or(z.literal('')),
  startDate: z.string().min(1, { message: 'Start date is required.' }),
  endDate: z.string().min(1, { message: 'End date is required.' }),
  isActive: z.boolean().default(true),
  // Add other applicability fields here if needed (e.g., applicableProducts, applicableCategories)
});

export type CouponFormInputs = z.infer<typeof couponFormSchema>;

// --- Dummy Data for Initializing Form (replace with actual API fetch) ---
const DUMMY_COUPONS_DATA = [
  {
    id: 'coupon_abc_123',
    code: 'SAVEBIG20',
    description: '20% off for new customers',
    discountType: 'percentage' as const,
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
    discountType: 'free_shipping' as const,
    discountValue: 0,
    minimumSpend: undefined,
    usageLimitPerCoupon: undefined,
    usageLimitPerCustomer: 1,
    startDate: '2025-05-15',
    endDate: '2025-07-31',
    isActive: true,
  },
];

interface CouponFormProps {
  couponId?: string; // Optional: ID of the coupon to edit
  onSave: (data: CouponFormInputs) => void; // Callback when the form is successfully saved
  onCancel: () => void; // Callback when the form is cancelled
}

const CouponForm: React.FC<CouponFormProps> = ({ couponId, onSave, onCancel }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CouponFormInputs>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      discountType: 'percentage',
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  });

  const discountType = watch('discountType');

  // Effect to load existing coupon data for editing or reset for new creation
  useEffect(() => {
    if (couponId) {
      // In a real app, fetch from API: fetchCouponById(couponId)
      const existingCoupon = DUMMY_COUPONS_DATA.find(c => c.id === couponId);
      if (existingCoupon) {
        reset({
          ...existingCoupon,
          // Ensure number inputs get empty string if undefined for proper form control
          discountValue: existingCoupon.discountValue,
          minimumSpend: existingCoupon.minimumSpend || '',
          usageLimitPerCoupon: existingCoupon.usageLimitPerCoupon || '',
          usageLimitPerCustomer: existingCoupon.usageLimitPerCustomer || '',
        });
      } else {
        console.warn(`Coupon with ID ${couponId} not found. Resetting form to create new.`);
        // If ID is provided but coupon not found, reset to default for new.
        reset({
          discountType: 'percentage',
          isActive: true,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
      }
    } else {
      // Reset form for new coupon creation
      reset({
        discountType: 'percentage',
        isActive: true,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    }
  }, [couponId, reset]);

  // Effect to automatically set discountValue to 0 if discountType becomes 'free_shipping'
  useEffect(() => {
    if (discountType === 'free_shipping') {
      setValue('discountValue', 0);
    }
  }, [discountType, setValue]);

  const onSubmit: SubmitHandler<CouponFormInputs> = async (data) => {
    console.log("Submitting Coupon Data:", data);
    // Here you would typically send data to your backend API
    // e.g., if (couponId) { await updateCoupon(couponId, data); } else { await createCoupon(data); }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      // Call the onSave prop, passing the form data back to the parent
      onSave(data);
    } catch (error) {
      console.error("Failed to save coupon:", error);
      alert('Failed to save coupon. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Coupon Code */}
      <div>
        <Label htmlFor="code" className="flex items-center text-charcoal-gray mb-2">
          <Tag className="w-4 h-4 mr-2" /> Coupon Code <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="code"
          {...register('code')}
          placeholder="e.g., BLACKFRIDAY20, FREESHIP"
          className={errors.code ? 'border-red-500' : ''}
        />
        {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
      </div>

      {/* Description (Optional) */}
      <div>
        <Label htmlFor="description" className="flex items-center text-charcoal-gray mb-2">
          <Hash className="w-4 h-4 mr-2" /> Description (Internal)
        </Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="e.g., 20% off for first-time buyers, Free shipping on orders over $50"
          rows={3}
        />
      </div>

      {/* Discount Type */}
      <div>
        <Label htmlFor="discountType" className="flex items-center text-charcoal-gray mb-2">
          <Percent className="w-4 h-4 mr-2" /> Discount Type <span className="text-red-500 ml-1">*</span>
        </Label>
        <Select onValueChange={(value: CouponFormInputs['discountType']) => setValue('discountType', value)} defaultValue={discountType}>
          <SelectTrigger className={errors.discountType ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select discount type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage (%)</SelectItem>
            <SelectItem value="fixed_amount">Fixed Amount (₹)</SelectItem>
            <SelectItem value="free_shipping">Free Shipping</SelectItem>
          </SelectContent>
        </Select>
        {errors.discountType && <p className="text-red-500 text-sm mt-1">{errors.discountType.message}</p>}
      </div>

      {/* Discount Value (Conditional) */}
      {discountType !== 'free_shipping' && (
        <div>
          <Label htmlFor="discountValue" className="flex items-center text-charcoal-gray mb-2">
            {discountType === 'percentage' ? <Percent className="w-4 h-4 mr-2" /> : <IndianRupee className="w-4 h-4 mr-2" />}
            Discount Value <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="discountValue"
            type="number"
            step="0.01" // Allow decimals for both types
            {...register('discountValue')}
            placeholder={discountType === 'percentage' ? 'e.g., 10, 25.5' : 'e.g., 50, 1000'}
            className={errors.discountValue ? 'border-red-500' : ''}
          />
          {errors.discountValue && <p className="text-red-500 text-sm mt-1">{errors.discountValue.message}</p>}
        </div>
      )}

      {/* Minimum Spend (Optional) */}
      <div>
        <Label htmlFor="minimumSpend" className="flex items-center text-charcoal-gray mb-2">
          <IndianRupee className="w-4 h-4 mr-2" /> Minimum Spend (Optional)
        </Label>
        <Input
          id="minimumSpend"
          type="number"
          step="0.01"
          {...register('minimumSpend')}
          placeholder="e.g., 100, 500"
          className={errors.minimumSpend ? 'border-red-500' : ''}
        />
        {errors.minimumSpend && <p className="text-red-500 text-sm mt-1">{errors.minimumSpend.message}</p>}
      </div>

      {/* Usage Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="usageLimitPerCoupon" className="flex items-center text-charcoal-gray mb-2">
            <Hash className="w-4 h-4 mr-2" /> Usage Limit per Coupon (Optional)
          </Label>
          <Input
            id="usageLimitPerCoupon"
            type="number"
            step="1"
            {...register('usageLimitPerCoupon')}
            placeholder="e.g., 100 (total uses)"
            className={errors.usageLimitPerCoupon ? 'border-red-500' : ''}
          />
          {errors.usageLimitPerCoupon && <p className="text-red-500 text-sm mt-1">{errors.usageLimitPerCoupon.message}</p>}
        </div>
        <div>
          <Label htmlFor="usageLimitPerCustomer" className="flex items-center text-charcoal-gray mb-2">
            <Users className="w-4 h-4 mr-2" /> Usage Limit per Customer (Optional)
          </Label>
          <Input
            id="usageLimitPerCustomer"
            type="number"
            step="1"
            {...register('usageLimitPerCustomer')}
            placeholder="e.g., 1 (one time per user)"
            className={errors.usageLimitPerCustomer ? 'border-red-500' : ''}
          />
          {errors.usageLimitPerCustomer && <p className="text-red-500 text-sm mt-1">{errors.usageLimitPerCustomer.message}</p>}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="startDate" className="flex items-center text-charcoal-gray mb-2">
            <CalendarDays className="w-4 h-4 mr-2" /> Start Date <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate')}
            className={errors.startDate ? 'border-red-500' : ''}
          />
          {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}
        </div>
        <div>
          <Label htmlFor="endDate" className="flex items-center text-charcoal-gray mb-2">
            <CalendarDays className="w-4 h-4 mr-2" /> End Date <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="endDate"
            type="date"
            {...register('endDate')}
            className={errors.endDate ? 'border-red-500' : ''}
          />
          {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>}
        </div>
      </div>

      {/* Active Status with Shadcn UI Switch */}
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={watch('isActive')}
          onCheckedChange={(checked) => setValue('isActive', checked)}
        />
        <Label htmlFor="isActive" className="text-charcoal-gray cursor-pointer">
          Coupon is Active
        </Label>
      </div>

      {/* Product/Category Applicability (Conceptual Placeholder) */}
      <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-charcoal-gray mb-3 flex items-center">
              <Package className="w-4 h-4 mr-2" /> Applicability (Optional)
          </h3>
          <p className="text-gray-600 text-sm mb-4">
              Leave blank to apply to all products/order.
          </p>
          <div className="space-y-4">
              <div>
                  <Label htmlFor="appliesTo" className="flex items-center text-charcoal-gray mb-2">
                      Applies To:
                  </Label>
                  <Select disabled> {/* Disabled as a placeholder for now */}
                      <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Products" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">All Products</SelectItem>
                          <SelectItem value="specific_categories">Specific Categories</SelectItem>
                          <SelectItem value="specific_products">Specific Products</SelectItem>
                      </SelectContent>
                  </Select>
                  <p className="text-gray-500 text-xs mt-1">
                      (This section requires advanced UI components like multi-select or product search.)
                  </p>
              </div>
          </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel} // Call the parent's onCancel prop
          disabled={isSubmitting}
        >
          <XCircle className="w-4 h-4 mr-2" /> Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Saving...' : (couponId ? 'Save Changes' : 'Create Coupon')}
        </Button>
      </div>
    </form>
  );
};

export default CouponForm;
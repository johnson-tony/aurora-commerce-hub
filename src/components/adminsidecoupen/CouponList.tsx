import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define the interface for coupon data (IMPORTANT: MUST MATCH BACKEND/DB PROPERTY NAMES)
interface CouponDisplayData {
  id: string;
  code: string;
  description?: string;
  // --- CORRECTED PROPERTY NAMES TO MATCH BACKEND/DB ---
  discount_type: "percentage" | "fixed_amount" | "free_shipping"; // Changed from discountType
  discount_value: number; // Changed from discountValue
  minimum_spend?: number; // Changed from minimumSpend
  usage_limit_per_coupon?: number; // Changed from usageLimitPerCoupon
  usage_limit_per_customer?: number; // Changed from usageLimitPerCustomer
  start_date: string; // Changed from startDate
  end_date: string; // Changed from endDate
  is_active: boolean; // Changed from isActive
  // Add these fields as they come from the backend, even if not directly displayed
  created_at?: string;
  updated_at?: string;
}

interface CouponListProps {
  coupons: CouponDisplayData[];
  onEdit: (couponId: string) => void;
  onDelete: (couponId: string) => void;
}

const CouponList: React.FC<CouponListProps> = ({
  coupons,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Coupon Code
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Type
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Value
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Usage Limit
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Validity
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {coupons.map((coupon) => {
            const now = new Date();
            // --- USE CORRECTED PROPERTY NAMES HERE ---
            const startDate = new Date(coupon.start_date);
            const endDate = new Date(coupon.end_date);

            let statusText = "Active";
            let statusClass = "bg-green-100 text-green-800";

            // --- USE CORRECTED PROPERTY NAME `is_active` ---
            if (!coupon.is_active) {
              statusText = "Disabled";
              statusClass = "bg-gray-100 text-gray-800";
            } else if (now < startDate) {
              statusText = "Upcoming";
              statusClass = "bg-blue-100 text-blue-800";
            } else if (now > endDate) {
              statusText = "Expired";
              statusClass = "bg-red-100 text-red-800";
            }

            return (
              <tr key={coupon.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {coupon.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {/* Use discount_type and replace underscore for display */}
                  {coupon.discount_type.replace("_", " ")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {/* Use discount_type and discount_value */}
                  {coupon.discount_type === "percentage"
                    ? `${coupon.discount_value}%`
                    : coupon.discount_type === "fixed_amount"
                    ? `₹${coupon.discount_value.toFixed(2)}`
                    : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {/* Use usage_limit_per_coupon */}
                  {typeof coupon.usage_limit_per_coupon === "number"
                    ? coupon.usage_limit_per_coupon
                    : "Unlimited"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {/* Use start_date and end_date */}
                  {coupon.start_date} to {coupon.end_date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}
                  >
                    {statusText}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Edit Coupon"
                    onClick={() => onEdit(coupon.id)}
                    className="text-deep-indigo hover:text-indigo-900 mr-4"
                  >
                    <Edit className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete Coupon"
                    onClick={() => onDelete(coupon.id)}
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
  );
};

export default CouponList;

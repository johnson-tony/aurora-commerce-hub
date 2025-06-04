// src/pages/checkout/ShippingStep.tsx

import React from 'react';

// Placeholder type for shipping details.
export interface ShippingDetails {
  email: string;
  phone: string;
  fullName: string;
  address1: string;
  address2: string; // Optional
  city: string;
  state: string;
  zip: string;
  country: string;
  shippingMethod: 'standard' | 'express';
}

interface ShippingStepProps {
  shippingDetails: ShippingDetails;
  onUpdate: (details: ShippingDetails) => void;
  onNext: () => void;
  // Replace `useToast` with your actual toast implementation (e.g., from Shadcn)
  // For demonstration, we'll use a simple console.log for toasts.
  useToast: () => { toast: (options: { title: string; description: string; variant: string }) => void };
}

const ShippingStep: React.FC<ShippingStepProps> = ({ shippingDetails, onUpdate, onNext, useToast }) => {
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onUpdate({ ...shippingDetails, [name]: value });
  };

  const handleShippingMethodChange = (method: 'standard' | 'express') => {
    onUpdate({ ...shippingDetails, shippingMethod: method });
  };

  const validateAndProceed = () => {
    // Basic validation for demonstration. Expand as needed.
    const { email, phone, fullName, address1, city, state, zip, country } = shippingDetails;
    if (!email || !phone || !fullName || !address1 || !city || !state || !zip || !country) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required shipping details.",
        variant: "destructive",
      });
      return;
    }
    // Add more specific validations (email format, phone number format, etc.)
    onNext();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">1. Contact & Shipping Information</h2>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          {/* Replace with Shadcn Input */}
          <input
            type="email"
            id="email"
            name="email"
            value={shippingDetails.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          {/* Replace with Shadcn Input */}
          <input
            type="tel"
            id="phone"
            name="phone"
            value={shippingDetails.phone}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
      </div>

      {/* Shipping Address */}
      <div className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          {/* Replace with Shadcn Input */}
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={shippingDetails.fullName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
          {/* Replace with Shadcn Input */}
          <input
            type="text"
            id="address1"
            name="address1"
            value={shippingDetails.address1}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
          {/* Replace with Shadcn Input */}
          <input
            type="text"
            id="address2"
            name="address2"
            value={shippingDetails.address2}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
            {/* Replace with Shadcn Input */}
            <input
              type="text"
              id="city"
              name="city"
              value={shippingDetails.city}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
            {/* Replace with Shadcn Input */}
            <input
              type="text"
              id="state"
              name="state"
              value={shippingDetails.state}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
            {/* Replace with Shadcn Input */}
            <input
              type="text"
              id="zip"
              name="zip"
              value={shippingDetails.zip}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          {/* Replace with Shadcn Select */}
          <select
            id="country"
            name="country"
            value={shippingDetails.country}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            required
          >
            <option value="">Select Country</option>
            <option value="USA">United States</option>
            <option value="CAN">Canada</option>
            <option value="IND">India</option>
            {/* Add more countries */}
          </select>
        </div>
      </div>

      {/* Shipping Method */}
      <div className="space-y-2">
        <p className="block text-sm font-medium text-gray-700">Shipping Method</p>
        {/* Replace with Shadcn RadioGroup */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer">
            <input
              type="radio"
              name="shippingMethod"
              value="standard"
              checked={shippingDetails.shippingMethod === 'standard'}
              onChange={() => handleShippingMethodChange('standard')}
              className="form-radio h-4 w-4 text-indigo-600"
            />
            <span>Standard Shipping (5-7 business days) - $0.00</span>
          </label>
          <label className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer">
            <input
              type="radio"
              name="shippingMethod"
              value="express"
              checked={shippingDetails.shippingMethod === 'express'}
              onChange={() => handleShippingMethodChange('express')}
              className="form-radio h-4 w-4 text-indigo-600"
            />
            <span>Express Shipping (2-3 business days) - $15.00</span>
          </label>
        </div>
        {/* Add conditional message for free shipping if applicable */}
        {/* {appliedCoupon && appliedCoupon.code === 'FREESHIP' && (
          <p className="text-green-600 text-sm mt-2">Free shipping applied with coupon!</p>
        )} */}
      </div>

      {/* Navigation */}
      <div className="flex justify-end mt-6">
        {/* Replace with Shadcn Button */}
        <button
          onClick={validateAndProceed}
          className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
};

export default ShippingStep;
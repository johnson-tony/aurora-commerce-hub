// src/pages/checkout/ShippingStep.tsx

import React from 'react';

// Assuming ShippingDetails interface is defined here or imported
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
    shippingMethod: 'standard' | 'express'; // Example
}

interface ShippingStepProps {
    shippingDetails: ShippingDetails;
    onUpdateShipping: (details: ShippingDetails) => void;
}

const ShippingStep: React.FC<ShippingStepProps> = ({ shippingDetails, onUpdateShipping }) => {
    // Implement your shipping form here
    // Example:
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onUpdateShipping({ ...shippingDetails, [name]: value });
    };

    return (
        <div>
            <h3 className="text-2xl font-semibold mb-4">Shipping Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={shippingDetails.email}
                    onChange={handleChange}
                    className="p-2 border rounded"
                />
                <input
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={shippingDetails.phone}
                    onChange={handleChange}
                    className="p-2 border rounded"
                />
                <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={shippingDetails.fullName}
                    onChange={handleChange}
                    className="p-2 border rounded col-span-full"
                />
                <input
                    type="text"
                    name="address1"
                    placeholder="Address Line 1"
                    value={shippingDetails.address1}
                    onChange={handleChange}
                    className="p-2 border rounded col-span-full"
                />
                 <input
                    type="text"
                    name="address2"
                    placeholder="Address Line 2 (Optional)"
                    value={shippingDetails.address2}
                    onChange={handleChange}
                    className="p-2 border rounded col-span-full"
                />
                <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={shippingDetails.city}
                    onChange={handleChange}
                    className="p-2 border rounded"
                />
                <input
                    type="text"
                    name="state"
                    placeholder="State/Province"
                    value={shippingDetails.state}
                    onChange={handleChange}
                    className="p-2 border rounded"
                />
                <input
                    type="text"
                    name="zip"
                    placeholder="Zip/Postal Code"
                    value={shippingDetails.zip}
                    onChange={handleChange}
                    className="p-2 border rounded"
                />
                <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={shippingDetails.country}
                    onChange={handleChange}
                    className="p-2 border rounded"
                />
            </div>
            <div className="mt-4">
                <label className="block text-lg font-medium text-gray-700 mb-2">Shipping Method</label>
                <select
                    name="shippingMethod"
                    value={shippingDetails.shippingMethod}
                    onChange={handleChange}
                    className="p-2 border rounded w-full"
                >
                    <option value="standard">Standard Shipping (3-5 business days)</option>
                    <option value="express">Express Shipping (1-2 business days) - $15.00</option>
                </select>
            </div>
            {/* Add more form elements and UI for shipping details */}
        </div>
    );
};

export default ShippingStep;
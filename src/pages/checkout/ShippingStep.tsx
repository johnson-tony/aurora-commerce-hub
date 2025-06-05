// src/pages/checkout/ShippingStep.tsx

import React from 'react';
// Import Shadcn UI components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast'; // Correct import for Shadcn's useToast
import { useAuth } from '@/context/AuthContext'; // Import useAuth to get the token

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
}

const ShippingStep: React.FC<ShippingStepProps> = ({ shippingDetails, onUpdate, onNext }) => {
  const { toast } = useToast();
  const { user, token } = useAuth(); // Get the user and token from AuthContext

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdate({ ...shippingDetails, [name]: value });
  };

  const handleSelectChange = (value: string) => {
    onUpdate({ ...shippingDetails, country: value });
  };

  const handleShippingMethodChange = (method: 'standard' | 'express') => {
    onUpdate({ ...shippingDetails, shippingMethod: method });
  };

  const validateAndProceed = async () => { // Made the function async
    const { email, phone, fullName, address1, city, state, zip, country, shippingMethod } = shippingDetails;

    // Basic validation to ensure all required fields are filled
    if (!email || !phone || !fullName || !address1 || !city || !state || !zip || !country || !shippingMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required shipping details and select a shipping method.",
        variant: "destructive",
      });
      return;
    }

    // Ensure user is logged in and token is available for the API call
    if (!user || !token) {
        toast({
            title: "Authentication Error",
            description: "You must be logged in to proceed with checkout.",
            variant: "destructive",
        });
        return;
    }

    try {
        // Send shipping details to the backend
        const response = await fetch('http://localhost:5000/api/checkout/shipping', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Attach the JWT token for authentication
            },
            body: JSON.stringify(shippingDetails),
        });

        const data = await response.json(); // Parse the JSON response from the backend

        if (response.ok) { // Check if the request was successful (status 200-299)
            toast({
                title: "Shipping Details Saved",
                description: data.message, // Use the message from the backend response
            });
            onNext(); // Proceed to the next step in the checkout process
        } else {
            // Handle backend errors
            toast({
                title: "Error Saving Shipping Details",
                description: data.message || "Something went wrong while saving your shipping information.",
                variant: "destructive",
            });
        }
    } catch (error) {
        // Handle network errors (e.g., server is down, no internet)
        console.error("Network error saving shipping details:", error);
        toast({
            title: "Network Error",
            description: "Could not connect to the server. Please try again.",
            variant: "destructive",
        });
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-text-dark">1. Contact & Shipping Information</h2>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email" className="mb-1">Email Address</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={shippingDetails.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="phone" className="mb-1">Phone Number</Label>
          <Input
            type="tel"
            id="phone"
            name="phone"
            value={shippingDetails.phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
            required
            className="mt-1"
          />
        </div>
      </div>

      {/* Shipping Address */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName" className="mb-1">Full Name</Label>
          <Input
            type="text"
            id="fullName"
            name="fullName"
            value={shippingDetails.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="address1" className="mb-1">Address Line 1</Label>
          <Input
            type="text"
            id="address1"
            name="address1"
            value={shippingDetails.address1}
            onChange={handleChange}
            placeholder="123 Main St"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="address2" className="mb-1">Address Line 2 (Optional)</Label>
          <Input
            type="text"
            id="address2"
            name="address2"
            value={shippingDetails.address2}
            onChange={handleChange}
            placeholder="Apartment, Suite, Unit, etc."
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city" className="mb-1">City</Label>
            <Input
              type="text"
              id="city"
              name="city"
              value={shippingDetails.city}
              onChange={handleChange}
              placeholder="New York"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="state" className="mb-1">State / Province</Label>
            <Input
              type="text"
              id="state"
              name="state"
              value={shippingDetails.state}
              onChange={handleChange}
              placeholder="NY"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="zip" className="mb-1">ZIP / Postal Code</Label>
            <Input
              type="text"
              id="zip"
              name="zip"
              value={shippingDetails.zip}
              onChange={handleChange}
              placeholder="10001"
              required
              className="mt-1"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="country" className="mb-1">Country</Label>
          <Select name="country" value={shippingDetails.country} onValueChange={handleSelectChange} required>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USA">United States</SelectItem>
              <SelectItem value="CAN">Canada</SelectItem>
              <SelectItem value="IND">India</SelectItem>
              {/* Add more countries here */}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Shipping Method */}
      <div className="space-y-2">
        <Label className="block mb-1">Shipping Method</Label>
        <RadioGroup
          value={shippingDetails.shippingMethod}
          onValueChange={handleShippingMethodChange as (value: string) => void}
          className="space-y-2"
        >
          <Label htmlFor="standard" className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer">
            <RadioGroupItem value="standard" id="standard" />
            <span>Standard Shipping (5-7 business days) - $0.00</span>
          </Label>
          <Label htmlFor="express" className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer">
            <RadioGroupItem value="express" id="express" />
            <span>Express Shipping (2-3 business days) - $15.00</span>
          </Label>
        </RadioGroup>
      </div>

      {/* Navigation */}
      <div className="flex justify-end mt-6">
        <Button
          onClick={validateAndProceed}
          className="bg-accent-blue text-white hover:bg-accent-blue/90"
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
};

export default ShippingStep;
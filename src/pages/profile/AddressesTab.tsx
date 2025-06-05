// frontend/src/pages/profile/AddressesTab.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface Address {
  id: string;
  fullName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

interface AddressesTabProps {
  addresses: Address[];
  handleSetDefaultAddress: (id: string) => void;
  handleDeleteAddress: (id: string) => void;
  onAddressChange: () => void; // Callback to trigger re-fetch in parent
}

const API_BASE_URL = 'http://localhost:5000/api'; // Define your API base URL here

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const AddressesTab: React.FC<AddressesTabProps> = ({
  addresses,
  handleSetDefaultAddress,
  handleDeleteAddress,
  onAddressChange,
}) => {
  const { toast } = useToast();
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Omit<Address, 'id' | 'isDefault'> & { id?: string } | null>(null);

  const handleOpenAddModal = () => {
    setCurrentAddress({
      fullName: '', address1: '', address2: '', city: '', state: '', zip: '', country: ''
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (address: Address) => {
    setCurrentAddress({
      id: address.id,
      fullName: address.fullName,
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
    });
    setIsAddEditModalOpen(true);
  };

  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentAddress(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSaveAddress = async () => {
    if (!currentAddress) return;

    let res;
    try {
      if (currentAddress.id) {
        // Update existing address
        res = await fetch(`${API_BASE_URL}/user/addresses/${currentAddress.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(currentAddress),
        });
      } else {
        // Add new address
        res = await fetch(`${API_BASE_URL}/user/addresses`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(currentAddress),
        });
      }

      const data = await res.json();

      if (res.ok) {
        toast({ title: "Success", description: data.message });
        setIsAddEditModalOpen(false);
        onAddressChange(); // Trigger parent to re-fetch addresses
      } else {
        throw new Error(data.message || 'Failed to save address.');
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save address.", variant: "destructive" });
    }
  };


  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center">
        <CardTitle>Shipping Addresses</CardTitle>
        <Button size="sm" onClick={handleOpenAddModal}>Add New Address</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No addresses saved yet</p>
            <Button variant="outline" className="mt-4" onClick={handleOpenAddModal}>Add Address</Button>
          </div>
        ) : (
          addresses.map(address => (
            <div
              key={address.id}
              className={`border rounded-lg p-4 ${address.isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            >
              <div className="flex justify-between">
                <h3 className="font-medium">{address.fullName}</h3>
                {address.isDefault && <Badge variant="default">Default</Badge>}
              </div>
              <p className="text-sm mt-2">{address.address1}{address.address2 && `, ${address.address2}`}</p>
              <p className="text-sm">{address.city}, {address.state} - {address.zip}</p>
              <p className="text-sm">{address.country}</p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(address)}>Edit</Button>
                {!address.isDefault && (
                  <Button variant="outline" size="sm" onClick={() => handleSetDefaultAddress(address.id)}>
                    Set Default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 border-red-200 hover:bg-red-50"
                  onClick={() => handleDeleteAddress(address.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      {/* Add/Edit Address Modal */}
      <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentAddress?.id ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right">Full Name</Label>
              <Input id="fullName" name="fullName" value={currentAddress?.fullName || ''} onChange={handleAddressFormChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address1" className="text-right">Address Line 1</Label>
              <Input id="address1" name="address1" value={currentAddress?.address1 || ''} onChange={handleAddressFormChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address2" className="text-right">Address Line 2</Label>
              <Input id="address2" name="address2" value={currentAddress?.address2 || ''} onChange={handleAddressFormChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">City</Label>
              <Input id="city" name="city" value={currentAddress?.city || ''} onChange={handleAddressFormChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="state" className="text-right">State</Label>
              <Input id="state" name="state" value={currentAddress?.state || ''} onChange={handleAddressFormChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="zip" className="text-right">Zip Code</Label>
              <Input id="zip" name="zip" value={currentAddress?.zip || ''} onChange={handleAddressFormChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="country" className="text-right">Country</Label>
              <Input id="country" name="country" value={currentAddress?.country || ''} onChange={handleAddressFormChange} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" onClick={handleSaveAddress}>Save Address</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AddressesTab;
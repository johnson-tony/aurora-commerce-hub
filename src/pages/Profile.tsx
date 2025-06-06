// frontend/src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import { useToast } from '@/components/ui/use-toast';

import UserProfileHeader from './profile/UserProfileHeader';
import PersonalInformationTab from './profile/PersonalInformationTab';
import AddressesTab from './profile/AddressesTab';
import AccountSettingsTab from './profile/AccountSettingsTab';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

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

const API_BASE_URL = 'http://localhost:5000/api'; // Define your API base URL here

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  console.log("getAuthHeaders: Token retrieved from localStorage:", token);
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const Profile = () => {
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (response.ok && data) {
        setUserProfile({
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg' // Keep mock avatar
        });
        return true;
      } else {
        throw new Error(data.message || 'Failed to fetch profile.');
      }
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load user profile.",
        variant: "destructive",
      });
      return false;
    }
  };

  const fetchUserAddresses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/addresses`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (response.ok && data) {
        setAddresses(data.map((addr: any) => ({
          id: String(addr.id),
          fullName: addr.full_name,
          address1: addr.address1,
          address2: addr.address2,
          city: addr.city,
          state: addr.state,
          zip: addr.zip,
          country: addr.country,
          isDefault: addr.is_default === 1,
        })));
        return true;
      } else {
        throw new Error(data.message || 'Failed to fetch addresses.');
      }
    } catch (err: any) {
      console.error("Error fetching user addresses:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load user addresses.",
        variant: "destructive",
      });
      return false;
    }
  };

  const fetchAllUserData = async () => {
    setLoading(true);
    setError(null);
    const profileSuccess = await fetchUserProfile();
    const addressesSuccess = await fetchUserAddresses();

    if (!profileSuccess || !addressesSuccess) {
      setError("Failed to load all user data. Some information might be missing.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllUserData();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (userProfile) {
      setUserProfile({ ...userProfile, [name]: value });
    }
  };

  const handleSaveProfile = async () => {
    if (!userProfile) return;
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userProfile),
      });
      const data = await response.json();
      if (response.ok) {
        setIsEditingProfile(false);
        toast({
          title: "Success",
          description: data.message,
        });
      } else {
        throw new Error(data.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save profile.",
        variant: "destructive",
      });
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/addresses/${id}/set-default`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
        });
        // Re-fetch addresses to ensure correct default state
        await fetchUserAddresses();
      } else {
        throw new Error(data.message || 'Failed to set default address.');
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to set default address.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/addresses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
        });
        // Re-fetch addresses to ensure correct state after deletion (especially if default was deleted)
        await fetchUserAddresses();
      } else {
        throw new Error(data.message || 'Failed to delete address.');
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete address.",
        variant: "destructive",
      });
    }
  };

  // Callback for AddressesTab to signal address changes
  const handleAddressChange = () => {
    fetchAllUserData(); // Re-fetch all data to refresh addresses
  };


  if (loading) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">Loading profile...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center text-red-600">{error}</div>
      </>
    );
  }

  if (!userProfile) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">No user profile found. Please log in.</div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <UserProfileHeader userProfile={userProfile} />

        <Tabs defaultValue="personal-information" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal-information">Personal Information</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="account-settings">Account Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="personal-information" className="mt-6">
            <PersonalInformationTab
              userProfile={userProfile}
              isEditingProfile={isEditingProfile}
              handleProfileChange={handleProfileChange}
              setIsEditingProfile={setIsEditingProfile}
              handleSaveProfile={handleSaveProfile}
            />
          </TabsContent>

          <TabsContent value="addresses" className="mt-6">
            <AddressesTab
              addresses={addresses}
              handleSetDefaultAddress={handleSetDefaultAddress}
              handleDeleteAddress={handleDeleteAddress}
              onAddressChange={handleAddressChange} // Pass the refresh callback
            />
          </TabsContent>

          <TabsContent value="account-settings" className="mt-6">
            <AccountSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Profile;
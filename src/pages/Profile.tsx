// src/pages/Profile.tsx

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';

// Placeholder for useToast (replace with your actual Shadcn useToast import and implementation)
const useToast = () => {
    return {
        toast: ({ title, description, variant }: { title: string; description: string; variant: "default" | "success" | "destructive" }) => {
            console.log(`Toast: ${title} - ${description} (Variant: ${variant})`);
            // In a real app, you'd use shadcnToast({ title, description, variant }) here.
        }
    };
};

// --- Mock Data Structures (replace with data fetched from your backend) ---
interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
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

// --- Mock Data ---
const mockUserProfile: UserProfile = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
};

const mockAddresses: Address[] = [
    { id: 'addr-1', fullName: 'John Doe', address1: '123 Main St', address2: 'Apt 4B', city: 'Bengaluru', state: 'Karnataka', zip: '560001', country: 'India', isDefault: true },
    { id: 'addr-2', fullName: 'Jane Doe', address1: '456 Oak Ave', city: 'Mysuru', state: 'Karnataka', zip: '570001', country: 'India', isDefault: false },
];

// --- Profile Component ---
const Profile: React.FC = () => {
    // Active tab no longer includes 'dashboard'
    const [activeTab, setActiveTab] = useState<'personal' | 'addresses' | 'settings'>('personal');
    const [userProfile, setUserProfile] = useState<UserProfile>(mockUserProfile);
    const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    // --- Handlers for Personal Information ---
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserProfile({ ...userProfile, [name]: value });
    };

    const handleSaveProfile = () => {
        if (!userProfile.name || !userProfile.email || !userProfile.phone) {
            toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
            return;
        }
        console.log("Saving profile:", userProfile);
        toast({ title: "Success", description: "Profile updated successfully!", variant: "success" });
        setIsEditingProfile(false);
    };

    // --- Handlers for Addresses (Simplified) ---
    const handleSetDefaultAddress = (id: string) => {
        setAddresses(addresses.map(addr =>
            addr.id === id ? { ...addr, isDefault: true } : { ...addr, isDefault: false }
        ));
        toast({ title: "Success", description: "Default address updated.", variant: "success" });
    };

    const handleDeleteAddress = (id: string) => {
        setAddresses(addresses.filter(addr => addr.id !== id));
        toast({ title: "Success", description: "Address deleted.", variant: "default" });
    };

    return (
        <div className="min-h-screen bg-soft-ivory">
            <Navigation />
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Dynamic Profile Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6 rounded-lg shadow-md mb-8">
                    <h1 className="text-3xl font-bold mb-2">Hello, {userProfile.name}!</h1>
                    <p className="text-lg text-indigo-100">Welcome to your personal account management.</p>
                    <div className="mt-4 flex flex-wrap gap-4">
                        <button
                            onClick={() => navigate('/my-orders')}
                            className="bg-white text-indigo-700 px-4 py-2 rounded-full font-medium hover:bg-indigo-100 transition-colors shadow-sm"
                        >
                            View My Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('addresses')}
                            className="bg-white text-indigo-700 px-4 py-2 rounded-full font-medium hover:bg-indigo-100 transition-colors shadow-sm"
                        >
                            Manage Addresses
                        </button>
                        <button
                            onClick={() => navigate('/wishlist')}
                            className="bg-white text-indigo-700 px-4 py-2 rounded-full font-medium hover:bg-indigo-100 transition-colors shadow-sm"
                        >
                            My Wishlist
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="flex-shrink-0 w-full md:w-56 bg-white p-4 rounded-lg shadow-sm">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 ${activeTab === 'personal' ? 'bg-indigo-500 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                        >
                            Personal Information
                        </button>
                        <button
                            onClick={() => setActiveTab('addresses')}
                            className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 ${activeTab === 'addresses' ? 'bg-indigo-500 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                        >
                            Shipping Addresses
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 ${activeTab === 'settings' ? 'bg-indigo-500 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                        >
                            Account Settings
                        </button>
                    </div>

                    {/* Tabs Content */}
                    <div className="flex-1 bg-white p-6 rounded-lg shadow-sm">
                        {/* Personal Information Tab Content */}
                        {activeTab === 'personal' && (
                            <div>
                                <h2 className="text-2xl font-semibold text-charcoal-gray mb-6">Personal Information</h2>
                                <div className="space-y-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
                                    {isEditingProfile ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Name Input */}
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={userProfile.name}
                                                    onChange={handleProfileChange}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                            {/* Email Input */}
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={userProfile.email}
                                                    onChange={handleProfileChange}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                            {/* Phone Input */}
                                            <div className="md:col-span-2">
                                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    value={userProfile.phone}
                                                    onChange={handleProfileChange}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Full Name</p>
                                                <p className="mt-1 text-gray-800 font-semibold">{userProfile.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Email Address</p>
                                                <p className="mt-1 text-gray-800 font-semibold">{userProfile.email}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <p className="text-sm font-medium text-gray-500">Phone Number</p>
                                                <p className="mt-1 text-gray-800 font-semibold">{userProfile.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                                        {isEditingProfile ? (
                                            <>
                                                <button onClick={handleSaveProfile} className="bg-indigo-600 text-white py-2 px-5 rounded-md hover:bg-indigo-700 font-medium transition-colors">Save Changes</button>
                                                <button onClick={() => setIsEditingProfile(false)} className="border border-gray-300 text-gray-700 py-2 px-5 rounded-md hover:bg-gray-100 font-medium transition-colors">Cancel</button>
                                            </>
                                        ) : (
                                            <button onClick={() => setIsEditingProfile(true)} className="bg-green-600 text-white py-2 px-5 rounded-md hover:bg-green-700 font-medium transition-colors">Edit Profile</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Shipping Addresses Tab Content */}
                        {activeTab === 'addresses' && (
                            <div>
                                <h2 className="text-2xl font-semibold text-charcoal-gray mb-6">Shipping Addresses</h2>
                                <div className="space-y-6">
                                    {addresses.length === 0 ? (
                                        <p className="text-gray-600 p-4 border rounded-lg bg-gray-50">No addresses saved yet. Add your first address!</p>
                                    ) : (
                                        addresses.map(address => (
                                            <div key={address.id} className={`p-6 border rounded-lg bg-white shadow-sm transition-all duration-200 ${address.isDefault ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-semibold text-lg text-gray-800">{address.fullName}</h3>
                                                    {address.isDefault && (
                                                        <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">Default</span>
                                                    )}
                                                </div>
                                                <p className="text-gray-700">{address.address1}{address.address2 && `, ${address.address2}`}</p>
                                                <p className="text-gray-700">{address.city}, {address.state} - {address.zip}</p>
                                                <p className="text-gray-700">{address.country}</p>

                                                <div className="mt-4 flex gap-3">
                                                    <button className="text-indigo-600 border border-indigo-200 px-3 py-1 rounded-md hover:bg-indigo-50 text-sm font-medium transition-colors">Edit</button>
                                                    {!address.isDefault && (
                                                        <button onClick={() => handleSetDefaultAddress(address.id)} className="text-green-600 border border-green-200 px-3 py-1 rounded-md hover:bg-green-50 text-sm font-medium transition-colors">Set as Default</button>
                                                    )}
                                                    <button onClick={() => handleDeleteAddress(address.id)} className="text-red-600 border border-red-200 px-3 py-1 rounded-md hover:bg-red-50 text-sm font-medium transition-colors">Delete</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <button className="mt-8 bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 font-semibold shadow-md transition-colors">Add New Address</button>
                            </div>
                        )}

                        {/* Account Settings Tab Content */}
                        {activeTab === 'settings' && (
                            <div>
                                <h2 className="text-2xl font-semibold text-charcoal-gray mb-4">Account Settings</h2>
                                <div className="space-y-6">
                                    <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                                        <h3 className="font-semibold text-lg mb-4">Change Password</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                                <input type="password" id="currentPassword" placeholder="••••••••" className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                                            </div>
                                            <div>
                                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                                <input type="password" id="newPassword" placeholder="••••••••" className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                                            </div>
                                            <div>
                                                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                                <input type="password" id="confirmNewPassword" placeholder="••••••••" className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                                            </div>
                                        </div>
                                        <button className="mt-6 bg-indigo-600 text-white py-2.5 px-6 rounded-md hover:bg-indigo-700 font-medium transition-colors">Update Password</button>
                                    </div>

                                    <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                                        <h3 className="font-semibold text-lg mb-4">Email & Notification Preferences</h3>
                                        <div className="space-y-3">
                                            <label className="flex items-center space-x-3 cursor-pointer">
                                                <input type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600 rounded" defaultChecked />
                                                <span className="text-gray-800">Receive marketing emails and offers</span>
                                            </label>
                                            <label className="flex items-center space-x-3 cursor-pointer">
                                                <input type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600 rounded" defaultChecked />
                                                <span className="text-gray-800">Receive order updates via SMS</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
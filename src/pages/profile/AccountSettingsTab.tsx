// frontend/src/pages/profile/AccountSettingsTab.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const API_BASE_URL = 'http://localhost:5000/api'; // Define your API base URL here

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const AccountSettingsTab: React.FC = () => {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setPasswordChangeLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        throw new Error(data.message || 'Failed to change password.');
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to change password.",
        variant: "destructive",
      });
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Change Password Section */}
        <div className="space-y-4">
          <h3 className="font-medium">Change Password</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleChangePassword} disabled={passwordChangeLoading}>
            {passwordChangeLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </div>

        {/* Notification Preferences Section - (These are frontend-only for now unless you build backend endpoints for them) */}
        <div className="space-y-4 pt-4">
          <h3 className="font-medium">Notification Preferences</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded text-blue-600" defaultChecked />
              <span>Marketing emails</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded text-blue-600" defaultChecked />
              <span>SMS notifications</span>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSettingsTab;
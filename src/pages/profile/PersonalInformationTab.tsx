import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface PersonalInformationTabProps {
  userProfile: UserProfile;
  isEditingProfile: boolean;
  handleProfileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setIsEditingProfile: (isEditing: boolean) => void;
  handleSaveProfile: () => void;
}

const PersonalInformationTab: React.FC<PersonalInformationTabProps> = ({
  userProfile,
  isEditingProfile,
  handleProfileChange,
  setIsEditingProfile,
  handleSaveProfile,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditingProfile ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  name="name"
                  value={userProfile.name}
                  onChange={handleProfileChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  name="email"
                  type="email"
                  value={userProfile.email}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  name="phone"
                  value={userProfile.phone}
                  onChange={handleProfileChange}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{userProfile.name}</h3>
                <p className="text-sm text-gray-500">{userProfile.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{userProfile.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{userProfile.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{userProfile.phone}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {isEditingProfile ? (
          <>
            <Button variant="outline" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </>
        ) : (
          <Button onClick={() => setIsEditingProfile(true)}>Edit Profile</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PersonalInformationTab;
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { User, Mail, Briefcase, MapPin, Loader2, Users } from 'lucide-react';
import { Office365UsersService } from '../services/Office365UsersService';
import type { GraphUser_V1 } from '../Models/Office365UsersModel';

export function Office365Test() {
  const [currentUser, setCurrentUser] = useState<GraphUser_V1 | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCurrentUser = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current user profile
      const profileResult = await Office365UsersService.MyProfile_V2("id,displayName,jobTitle,mail,officeLocation,department");
      const profile = profileResult.data;
      setCurrentUser(profile);

      // Try to get user photo
      if (profile?.id) {
        try {
          const photoResult = await Office365UsersService.UserPhoto_V2(profile.id);
          if (photoResult.data) {
            setUserPhoto(`data:image/jpeg;base64,${photoResult.data}`);
          }
        } catch (photoError) {
          console.log('No photo available or error fetching photo:', photoError);
        }
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load user profile. Make sure you are connected to Office 365.');
    } finally {
      setLoading(false);
    }
  };

  const testUserSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      // Search for users in the organization
      const searchResult = await Office365UsersService.SearchUser("john");
      console.log('Search results:', searchResult.data);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Office 365 Integration Test</h1>
          <p className="text-muted-foreground">
            Test Power Apps Code Apps integration with Office 365 Users connector
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Users className="w-4 h-4 mr-2" />
          Power Apps Connected
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Current User Profile
            </CardTitle>
            <CardDescription>
              Your Office 365 profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={loadCurrentUser} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load My Profile'
              )}
            </Button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}

            {currentUser && (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {userPhoto ? (
                    <img 
                      src={userPhoto} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{currentUser.displayName}</h3>
                    {currentUser.mail && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {currentUser.mail}
                      </div>
                    )}
                    {currentUser.jobTitle && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="w-4 h-4" />
                        {currentUser.jobTitle}
                      </div>
                    )}
                    {currentUser.officeLocation && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {currentUser.officeLocation}
                      </div>
                    )}
                  </div>
                </div>
                
                {currentUser.department && (
                  <Badge variant="secondary">
                    {currentUser.department}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Search Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Search Test
            </CardTitle>
            <CardDescription>
              Test searching for users in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testUserSearch}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search Users (Check Console)'
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Search results will be logged to the browser console.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>
            Power Apps Code Apps connection information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Office 365 Users Connector:</span>
              <Badge variant="default">Connected</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Power Platform SDK:</span>
              <Badge variant="default">Initialized</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Environment:</span>
              <span className="text-sm text-muted-foreground">First Release</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Bell, User, LogOut, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Office365Service, type Office365User as SimpleUser } from '../../services/SimpleOffice365Service';

export function TopNavigation() {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Get current user profile using simplified Office365 service
        const profile = await Office365Service.getCurrentUser();
        setUser(profile);
        
        // Note: User photo functionality not implemented in consolidated service
        // if (profile?.id) {
        //   const photoData = await Office365Service.getUserPhoto(profile.id);
        //   if (photoData) {
        //     setUserPhoto(`data:image/jpeg;base64,${photoData}`);
        //   }
        // }
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Don't set fallback data - let it remain null to show real connection status
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
      {/* Left Side - Title */}
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-foreground">
          Digital Investigations & Grievance System
        </h2>
      </div>
      
      {/* Center - Global Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Global search: cases, employees, grievances..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        {/* SLA Status Indicator */}
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-200">
            SLA: 94.2% Compliance
          </Badge>
          <Badge variant="destructive">
            3 Overdue
          </Badge>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            5
          </Badge>
        </Button>

        {/* User Menu */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          <div className="hidden md:block">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            ) : user ? (
              <>
                <p className="text-sm font-medium">
                  {user.displayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.jobTitle || 'No job title'}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-red-600">
                  Office365 Not Connected
                </p>
                <p className="text-xs text-muted-foreground">
                  Check Power Platform connection
                </p>
              </>
            )}
          </div>
        </div>

        {/* Logout */}
        <Button variant="ghost" size="icon">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}

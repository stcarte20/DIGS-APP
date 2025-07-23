import { Bell, User, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export function TopNavigation() {
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
      {/* Page Title */}
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-foreground">
          Digital Investigations & Grievance System
        </h2>
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
            <p className="text-sm font-medium">John Investigator</p>
            <p className="text-xs text-muted-foreground">Senior Investigator</p>
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

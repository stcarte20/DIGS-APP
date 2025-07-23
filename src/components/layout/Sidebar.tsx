import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Inbox, 
  Calendar, 
  Search, 
  BarChart3, 
  Settings, 
  User, 
  Bell, 
  HelpCircle, 
  Shield,
  Scale
} from 'lucide-react';

const cn = (...inputs: (string | undefined)[]) => {
  return inputs.filter(Boolean).join(' ')
}

const navigationItems = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    description: 'Overview and metrics'
  },
  { 
    name: 'Cases', 
    href: '/cases', 
    icon: FileText,
    description: 'Investigation cases'
  },
  { 
    name: 'Grievances', 
    href: '/grievances', 
    icon: Scale,
    description: 'Union grievances'
  },
  { 
    name: 'Intake', 
    href: '/intake', 
    icon: Inbox,
    description: 'New case intake'
  },
  { 
    name: 'Calendar', 
    href: '/calendar', 
    icon: Calendar,
    description: 'Events and deadlines'
  },
  { 
    name: 'Search', 
    href: '/search', 
    icon: Search,
    description: 'Search cases & documents'
  },
  { 
    name: 'Reports', 
    href: '/reports', 
    icon: BarChart3,
    description: 'Analytics and reports'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings,
    description: 'System settings'
  },
  { 
    name: 'Profile', 
    href: '/profile', 
    icon: User,
    description: 'User profile'
  },
  { 
    name: 'Notifications', 
    href: '/notifications', 
    icon: Bell,
    description: 'Alerts and notifications'
  },
  { 
    name: 'Help', 
    href: '/help', 
    icon: HelpCircle,
    description: 'Help and documentation'
  },
  { 
    name: 'Office365 Test', 
    href: '/office365test', 
    icon: Shield,
    description: 'Power Platform testing'
  },
];

export function Sidebar() {
  return (
    <div className="flex flex-col w-64 bg-card border-r">
      {/* Logo and Title */}
      <div className="flex items-center h-16 px-6 border-b">
        <Shield className="h-8 w-8 text-primary mr-3" />
        <div>
          <h1 className="text-xl font-bold text-foreground">DIGS</h1>
          <p className="text-xs text-muted-foreground">Labor Relations</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            <div className="flex-1">
              <div>{item.name}</div>
              <div className="text-xs opacity-70">{item.description}</div>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          <p>DIGS v1.0.0</p>
          <p>© 2025 Labor Relations</p>
        </div>
      </div>
    </div>
  );
}

import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Briefcase,
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
  Scale,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  ClipboardList,
  Users,
  Gavel
} from 'lucide-react';

const cn = (...inputs: (string | undefined)[]) => {
  return inputs.filter(Boolean).join(' ')
}

// Navigation structure with groups
const navigationStructure = [
  {
    name: 'My Workspace',
    href: '/workspace',
    icon: Briefcase,
    description: 'Personal dashboard and tasks',
    type: 'single' as const
  },
  {
    name: 'Reporting',
    icon: TrendingUp,
    type: 'group' as const,
    children: [
      {
        name: 'Overview',
        href: '/overview',
        icon: LayoutDashboard,
        description: 'Analytics and metrics'
      },
      {
        name: 'Reports',
        href: '/reports',
        icon: BarChart3,
        description: 'Custom reports'
      }
    ]
  },
  {
    name: 'Investigations',
    icon: FileText,
    type: 'group' as const,
    children: [
      {
        name: 'Cases',
        href: '/cases',
        icon: FileText,
        description: 'Investigation cases'
      },
      {
        name: 'Intake',
        href: '/intake',
        icon: Inbox,
        description: 'New case intake'
      },
      {
        name: 'PRM',
        href: '/prm',
        icon: Users,
        description: 'Performance Review Meetings'
      }
    ]
  },
  {
    name: 'Grievances',
    icon: Scale,
    type: 'group' as const,
    children: [
      {
        name: 'All Grievances',
        href: '/grievances',
        icon: Scale,
        description: 'Union grievances'
      },
      {
        name: 'Arbitration',
        href: '/arbitration',
        icon: Gavel,
        description: 'Arbitration cases'
      }
    ]
  },
  {
    name: 'Tools',
    icon: ClipboardList,
    type: 'group' as const,
    children: [
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
        description: 'Global search'
      }
    ]
  }
];

const secondaryItems = [
  { 
    name: 'Notifications', 
    href: '/notifications', 
    icon: Bell,
    description: 'System notifications'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings,
    description: 'Application settings'
  },
  { 
    name: 'Profile', 
    href: '/profile', 
    icon: User,
    description: 'User profile'
  },
  { 
    name: 'Help', 
    href: '/help', 
    icon: HelpCircle,
    description: 'Help and support'
  }
];

interface NavigationGroupProps {
  group: typeof navigationStructure[0];
  isExpanded: boolean;
  onToggle: () => void;
}

function NavigationGroup({ group, isExpanded, onToggle }: NavigationGroupProps) {
  if (group.type === 'single') {
    const Icon = group.icon;
    return (
      <NavLink
        to={group.href!}
        className={({ isActive }) =>
          cn(
            'flex items-center px-6 py-3 text-sm font-medium rounded-lg mx-3 mb-1 transition-colors',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          )
        }
      >
        <Icon className="mr-3 h-5 w-5" />
        {group.name}
      </NavLink>
    );
  }

  const Icon = group.icon;
  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg mx-3 transition-colors"
      >
        <div className="flex items-center">
          <Icon className="mr-3 h-5 w-5" />
          {group.name}
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      
      {isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {group.children?.map((item) => {
            const ItemIcon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-6 py-2 text-sm rounded-lg mx-3 transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )
                }
              >
                <ItemIcon className="mr-3 h-4 w-4" />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Reporting': false,
    'Investigations': true, // Start with Investigations expanded
    'Grievances': false,
    'Tools': false
  });

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

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

      {/* Main Navigation */}
      <nav className="flex-1 py-4">
        <div className="space-y-1">
          {navigationStructure.map((item) => (
            <NavigationGroup
              key={item.name}
              group={item}
              isExpanded={expandedGroups[item.name] || false}
              onToggle={() => toggleGroup(item.name)}
            />
          ))}
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="border-t p-4">
        <div className="space-y-1">
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )
                }
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}

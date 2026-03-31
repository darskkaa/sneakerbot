import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  User,
  Globe,
  Settings,
  Zap,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: ListTodo },
  { name: 'Profiles', href: '/profiles', icon: User },
  { name: 'Proxies', href: '/proxies', icon: Globe },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="flex flex-col w-[220px] min-w-[220px] bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 h-14 px-4 border-b border-border">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary">
          <Zap className="w-4 h-4 text-white" fill="white" />
        </div>
        <span className="text-sm font-bold text-foreground tracking-tight">SneakerBot</span>
        <span className="ml-auto text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">PRO</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        <div className="px-2 mb-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Menu</p>
        </div>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')}
                />
                <span>{item.name}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto text-primary/60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-primary">
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {user?.email?.split('@')[0] ?? 'User'}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email ?? ''}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

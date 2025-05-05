
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings } from 'lucide-react'; // Added Settings icon
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Project Dashboard', icon: LayoutDashboard },
    { href: '/user-kpis', label: 'User KPIs', icon: Users },
    { href: '/admin-control', label: 'Admin Control', icon: Settings }, // Added Admin Control
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border p-4 flex flex-col">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-sidebar-primary">BizFlow</h2>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              pathname === item.href ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90' : ''
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      {/* Optional: Add footer or user profile section here */}
    </aside>
  );
};

export default Sidebar;

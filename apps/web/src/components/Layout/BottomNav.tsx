import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, TrendingUp, Target, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Transações',
    href: '/transactions',
    icon: Receipt,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: TrendingUp,
  },
  {
    title: 'Metas',
    href: '/goals',
    icon: Target,
  },
  {
    title: 'Orçamentos',
    href: '/budgets',
    icon: Wallet,
  },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex-1',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
              aria-label={item.title}
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className={cn('text-xs', isActive && 'text-primary font-medium')}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, TrendingUp, Target, Wallet, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';
import { typography } from '@/lib/typography';

const menuItems = [
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

export function Sidebar() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { isCollapsed, toggleSidebar } = useSidebar();

  const handleLogout = () => {
    clearAuth();
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <div className={cn(
      'hidden md:flex flex-col h-screen bg-card border-r border-border transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo/Header */}
      <div className={cn(
        'border-b border-border flex items-center',
        isCollapsed ? 'p-4 justify-center' : 'p-6 justify-between'
      )}>
        {!isCollapsed && (
          <div className="flex-1">
            <h1 className={typography.h3}>FinanceFlow</h1>
            {user && (
              <p className={`${typography.caption} mt-1`}>{user.name}</p>
            )}
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="min-h-[44px] min-w-[44px]"
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Minimizar sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className={cn('flex-1 space-y-1 overflow-y-auto', isCollapsed ? 'p-2' : 'p-4')}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center rounded-lg transition-colors min-h-[44px]',
                isCollapsed ? 'justify-center px-2' : 'gap-3 px-3',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className={typography.bodySmall}>{item.title}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn('border-t border-border space-y-2', isCollapsed ? 'p-2' : 'p-4')}>
        <Link
          to="/settings"
          className={cn(
            'flex items-center rounded-lg transition-colors min-h-[44px]',
            isCollapsed ? 'justify-center px-2' : 'gap-3 px-3',
            location.pathname === '/settings'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
          title={isCollapsed ? 'Configurações' : undefined}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className={typography.bodySmall}>Configurações</span>
          )}
        </Link>
        <Button
          variant="ghost"
          className={cn(
            'w-full min-h-[44px]',
            isCollapsed ? 'justify-center px-2' : 'justify-start'
          )}
          onClick={handleLogout}
          title={isCollapsed ? 'Sair' : undefined}
        >
          <LogOut className={cn('h-5 w-5 flex-shrink-0', !isCollapsed && 'mr-3')} />
          {!isCollapsed && (
            <span className={typography.bodySmall}>Sair</span>
          )}
        </Button>
      </div>
    </div>
  );
}


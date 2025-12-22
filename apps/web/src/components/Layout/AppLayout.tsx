import { SidebarProvider } from '@/contexts/SidebarContext';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        {/* Desktop Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
            <h1 className="text-lg font-bold">FinanceFlow</h1>
            <MobileNav />
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          <BottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}


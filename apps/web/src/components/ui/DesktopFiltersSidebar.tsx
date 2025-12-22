import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesktopFiltersSidebarProps {
  children: ReactNode;
  activeFiltersCount?: number;
  title?: string;
  className?: string;
}

export function DesktopFiltersSidebar({
  children,
  activeFiltersCount = 0,
  title = 'Filtros',
  className,
}: DesktopFiltersSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'relative hidden md:flex min-h-[44px] min-w-[44px]',
            activeFiltersCount > 0 && 'border-primary',
            className
          )}
          aria-label="Abrir filtros"
        >
          <Filter className="h-5 w-5" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-96 overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-xl">{title}</SheetTitle>
        </SheetHeader>
        <div className="mt-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}


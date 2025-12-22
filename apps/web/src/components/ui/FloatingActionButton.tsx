import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  label: string;
  className?: string;
}

export function FloatingActionButton({
  onClick,
  label,
  className,
}: FloatingActionButtonProps) {
  return (
    <>
      {/* Mobile: FAB */}
      <Button
        onClick={onClick}
        size="icon"
        className={cn(
          'fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg md:hidden',
          'bg-primary hover:bg-primary/90 text-primary-foreground',
          'transition-all hover:scale-110 active:scale-95',
          className
        )}
        aria-label={label}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Desktop: Botão normal */}
      <Button
        onClick={onClick}
        className={cn('hidden md:flex min-h-[44px]', className)}
      >
        <Plus className="h-4 w-4 mr-2" />
        {label}
      </Button>
    </>
  );
}


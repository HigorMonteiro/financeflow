import { cn } from '@/lib/utils';

interface AccountColorDotProps {
  color: string;
  accountName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
};

export function AccountColorDot({
  color,
  accountName,
  size = 'md',
  className,
}: AccountColorDotProps) {
  return (
    <div
      className={cn(
        'rounded-full inline-block flex-shrink-0',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: color }}
      title={accountName}
      aria-label={`Conta: ${accountName}`}
    />
  );
}


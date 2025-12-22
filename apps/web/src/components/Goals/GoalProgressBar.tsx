interface GoalProgressBarProps {
  progress: number;
  className?: string;
}

export function GoalProgressBar({ progress, className = '' }: GoalProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className={`w-full bg-muted rounded-full h-2 ${className}`}>
      <div
        className={`h-2 rounded-full transition-all ${
          clampedProgress >= 100
            ? 'bg-green-500'
            : clampedProgress >= 75
            ? 'bg-primary'
            : clampedProgress >= 50
            ? 'bg-blue-500'
            : 'bg-yellow-500'
        }`}
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
}


import { Goal } from '@/services/goals.service';
import { GoalProgressBar } from './GoalProgressBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Target, Calendar } from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
}

const goalTypeLabels: Record<Goal['type'], string> = {
  EMERGENCY_FUND: '💰 Fundo de Emergência',
  TRAVEL: '✈️ Viagem',
  PURCHASE: '🛒 Compra',
  INVESTMENT: '📈 Investimento',
  OTHER: '🎯 Outro',
};

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value));
  };

  const getDaysRemaining = () => {
    if (!goal.deadline) return null;
    const deadline = new Date(goal.deadline);
    const days = differenceInDays(deadline, new Date());
    return days;
  };

  const daysRemaining = getDaysRemaining();
  const isOverdue = goal.deadline ? isPast(new Date(goal.deadline)) && goal.progress < 100 : false;
  const isNearDeadline = daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0;
  const isCompleted = goal.progress >= 100;

  return (
    <Card className={`${isCompleted ? 'border-green-500' : isOverdue ? 'border-red-500' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <span>{goalTypeLabels[goal.type] || '🎯'}</span>
              <span className="text-lg">{goal.name}</span>
            </CardTitle>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
              </span>
              <span className="text-primary font-semibold">{Math.round(goal.progress)}%</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(goal)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(goal.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <GoalProgressBar progress={goal.progress} />
        
        {goal.deadline && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Prazo: {format(new Date(goal.deadline), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
            {daysRemaining !== null && (
              <span
                className={`font-medium ${
                  isOverdue
                    ? 'text-red-600'
                    : isNearDeadline
                    ? 'text-yellow-600'
                    : 'text-muted-foreground'
                }`}
              >
                {isOverdue
                  ? `(${Math.abs(daysRemaining)} dias de atraso)`
                  : `(${daysRemaining} dias restantes)`}
              </span>
            )}
          </div>
        )}

        {isCompleted && (
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <Target className="h-4 w-4" />
            <span>Meta concluída! 🎉</span>
          </div>
        )}

        {isOverdue && !isCompleted && (
          <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
            <span>⚠️ Prazo vencido</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


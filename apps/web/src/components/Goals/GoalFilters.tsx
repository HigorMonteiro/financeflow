import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Goal } from '@/services/goals.service';

export type FilterStatus = 'all' | 'active' | 'completed';
export type SortOption = 'deadline' | 'progress' | 'created';

interface GoalFiltersProps {
  status: FilterStatus;
  sortBy: SortOption;
  onStatusChange: (status: FilterStatus) => void;
  onSortChange: (sort: SortOption) => void;
}

export function GoalFilters({
  status,
  sortBy,
  onStatusChange,
  onSortChange,
}: GoalFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Filtros:</span>
        <Button
          variant={status === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange('all')}
        >
          Todas
        </Button>
        <Button
          variant={status === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange('active')}
        >
          Em Andamento
        </Button>
        <Button
          variant={status === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange('completed')}
        >
          Concluídas
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Ordenar por:</span>
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deadline">Prazo</SelectItem>
            <SelectItem value="progress">Progresso</SelectItem>
            <SelectItem value="created">Data de Criação</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}


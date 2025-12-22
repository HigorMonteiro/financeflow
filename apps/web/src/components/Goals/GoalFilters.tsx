import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MobileFilters } from '@/components/ui/MobileFilters';
import { Label } from '@/components/ui/label';

export type FilterStatus = 'all' | 'active' | 'completed';
export type SortOption = 'deadline' | 'progress' | 'created';

interface GoalFiltersProps {
  status: FilterStatus;
  sortBy: SortOption;
  onStatusChange: (status: FilterStatus) => void;
  onSortChange: (sort: SortOption) => void;
}

function GoalFiltersContent({
  status,
  sortBy,
  onStatusChange,
  onSortChange,
}: GoalFiltersProps) {
  const activeFiltersCount = (status !== 'all' ? 1 : 0) + 0; // Sort não conta como filtro ativo

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={status === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStatusChange('all')}
              className="min-h-[44px]"
            >
              Todas
            </Button>
            <Button
              variant={status === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStatusChange('active')}
              className="min-h-[44px]"
            >
              Em Andamento
            </Button>
            <Button
              variant={status === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStatusChange('completed')}
              className="min-h-[44px]"
            >
              Concluídas
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Ordenar por</Label>
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger className="min-h-[44px]">
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
    </>
  );
}

export function GoalFilters(props: GoalFiltersProps) {
  const activeFiltersCount = (props.status !== 'all' ? 1 : 0);

  return (
    <>
      {/* Mobile: Botão minimalista */}
      <MobileFilters
        activeFiltersCount={activeFiltersCount}
        title="Filtros de Metas"
        className="md:hidden"
      >
        <GoalFiltersContent {...props} />
      </MobileFilters>

      {/* Desktop: Filtros completos */}
      <div className="hidden md:flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filtros:</span>
          <Button
            variant={props.status === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => props.onStatusChange('all')}
            className="min-h-[44px]"
          >
            Todas
          </Button>
          <Button
            variant={props.status === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => props.onStatusChange('active')}
            className="min-h-[44px]"
          >
            Em Andamento
          </Button>
          <Button
            variant={props.status === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => props.onStatusChange('completed')}
            className="min-h-[44px]"
          >
            Concluídas
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Ordenar por:</span>
          <Select value={props.sortBy} onValueChange={(value) => props.onSortChange(value as SortOption)}>
            <SelectTrigger className="w-[180px] min-h-[44px]">
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
    </>
  );
}


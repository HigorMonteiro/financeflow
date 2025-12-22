import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ImportExportActionsProps {
  onImport?: () => void;
  onExport?: () => void;
}

export function ImportExportActions({
  onImport,
  onExport,
}: ImportExportActionsProps) {
  return (
    <>
      {/* Mobile: Dropdown Menu */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="min-h-[40px] min-w-[40px]">
              <Upload className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onImport && (
              <DropdownMenuItem onClick={onImport} className="min-h-[44px]">
                <Upload className="h-4 w-4 mr-2" />
                Importar CSV
              </DropdownMenuItem>
            )}
            {onExport && (
              <DropdownMenuItem onClick={onExport} className="min-h-[44px]">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop: Botões separados */}
      <div className="hidden md:flex gap-2">
        {onImport && (
          <Button onClick={onImport} variant="outline" size="sm" className="min-h-[44px]">
            <Upload className="h-4 w-4 mr-2" />
            Importar CSV
          </Button>
        )}
        {onExport && (
          <Button onClick={onExport} variant="outline" size="sm" className="min-h-[44px]">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        )}
      </div>
    </>
  );
}


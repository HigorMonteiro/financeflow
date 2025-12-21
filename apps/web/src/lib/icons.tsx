import * as LucideIcons from 'lucide-react';
import { ComponentType } from 'react';

/**
 * Renderiza um ícone do lucide-react baseado no nome do ícone
 */
export function getIcon(iconName: string): ComponentType<{ className?: string }> {
  // Mapear nomes de ícones para componentes do lucide-react
  const IconComponent = (LucideIcons as any)[iconName] as ComponentType<{ className?: string }>;
  
  // Se o ícone não existir, retornar um ícone padrão
  if (!IconComponent) {
    return LucideIcons.Receipt || LucideIcons.Circle;
  }
  
  return IconComponent;
}

/**
 * Renderiza um ícone com props customizadas
 */
export function renderIcon(
  iconName: string,
  className?: string,
  size?: number
): JSX.Element {
  const IconComponent = getIcon(iconName);
  return <IconComponent className={className} size={size} />;
}


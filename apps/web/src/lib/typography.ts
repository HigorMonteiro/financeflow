/**
 * Sistema de Tipografia Padronizado
 * 
 * Define classes utilitárias para tipografia responsiva
 * Mobile (< 768px), Desktop (>= 768px), Ultrawide (>= 1536px)
 */

export const typography = {
  // Títulos principais (h1)
  h1: 'text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold',
  
  // Títulos secundários (h2)
  h2: 'text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold',
  
  // Títulos terciários (h3)
  h3: 'text-base md:text-lg lg:text-xl xl:text-2xl font-semibold',
  
  // Subtítulos
  subtitle: 'text-xs md:text-sm lg:text-base text-muted-foreground',
  
  // Corpo do texto - padrão
  body: 'text-sm md:text-base lg:text-base',
  
  // Corpo do texto - pequeno
  bodySmall: 'text-xs md:text-sm lg:text-sm',
  
  // Corpo do texto - grande
  bodyLarge: 'text-base md:text-lg lg:text-xl',
  
  // Labels
  label: 'text-xs md:text-sm font-medium',
  
  // Caption/Notas
  caption: 'text-xs text-muted-foreground',
  
  // Valores monetários grandes
  currency: 'text-xl md:text-2xl lg:text-3xl font-bold',
  
  // Valores monetários médios
  currencyMedium: 'text-lg md:text-xl lg:text-2xl font-semibold',
  
  // Valores monetários pequenos
  currencySmall: 'text-sm md:text-base lg:text-lg font-medium',
} as const;


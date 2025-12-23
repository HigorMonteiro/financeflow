/**
 * Sistema de Tipografia Padronizado
 * 
 * Define classes utilitárias para tipografia responsiva
 * Mobile (< 768px), Desktop (>= 768px), Ultrawide (>= 1536px)
 * 
 * Mobile: text-sm = 0.75rem, text-2xl = 1rem
 */

export const typography = {
  // Títulos principais (h1)
  // Mobile: 1rem (text-2xl), Desktop: 1.5rem (text-2xl), lg: 1.875rem (text-3xl), xl: 2.25rem (text-4xl)
  h1: 'text-[1rem] md:text-2xl lg:text-3xl xl:text-4xl font-bold',
  
  // Títulos secundários (h2)
  // Mobile: 0.875rem (text-base), Desktop: 1.25rem (text-xl), lg: 1.5rem (text-2xl), xl: 1.875rem (text-3xl)
  h2: 'text-base md:text-xl lg:text-2xl xl:text-3xl font-semibold',
  
  // Títulos terciários (h3)
  // Mobile: 0.875rem (text-base), Desktop: 1.125rem (text-lg), lg: 1.25rem (text-xl), xl: 1.5rem (text-2xl)
  h3: 'text-base md:text-lg lg:text-xl xl:text-2xl font-semibold',
  
  // Subtítulos
  // Mobile: 0.75rem (text-xs), Desktop: 0.875rem (text-sm padrão Tailwind), lg: 1rem (text-base)
  subtitle: 'text-xs md:text-[0.875rem] lg:text-base text-muted-foreground',
  
  // Corpo do texto - padrão
  // Mobile: 0.75rem (text-sm), Desktop: 1rem (text-base)
  body: 'text-sm md:text-base lg:text-base',
  
  // Corpo do texto - pequeno
  // Mobile: 0.75rem (text-xs), Desktop: 0.875rem (text-sm)
  bodySmall: 'text-xs md:text-sm lg:text-sm',
  
  // Corpo do texto - grande
  // Mobile: 0.875rem (text-base), Desktop: 1.125rem (text-lg), lg: 1.25rem (text-xl)
  bodyLarge: 'text-base md:text-lg lg:text-xl',
  
  // Labels
  // Mobile: 0.75rem (text-xs), Desktop: 0.875rem (text-sm padrão Tailwind)
  label: 'text-xs md:text-[0.875rem] font-medium',
  
  // Caption/Notas
  // Mobile: 0.75rem (text-xs)
  caption: 'text-xs text-muted-foreground',
  
  // Valores monetários grandes
  // Mobile: 1rem (text-2xl), Desktop: 1.5rem (text-2xl), lg: 1.875rem (text-3xl)
  currency: 'text-[1rem] md:text-2xl lg:text-3xl font-bold',
  
  // Valores monetários médios
  // Mobile: 0.875rem (text-base), Desktop: 1.25rem (text-xl), lg: 1.5rem (text-2xl)
  currencyMedium: 'text-base md:text-xl lg:text-2xl font-semibold',
  
  // Valores monetários pequenos
  // Mobile: 0.75rem (text-sm customizado), Desktop: 1rem (text-base), lg: 1.125rem (text-lg)
  currencySmall: 'text-sm md:text-base lg:text-lg font-medium',
} as const;


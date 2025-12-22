/**
 * Utilitários para calcular períodos de fatura baseados nos dias de início e fim configurados na conta
 */

/**
 * Calcula o período de fatura atual baseado nos dias configurados
 * @param billingStartDay Dia do mês em que inicia a fatura (1-31)
 * @param billingEndDay Dia do mês em que termina a fatura (1-31)
 * @param referenceDate Data de referência (padrão: hoje)
 * @returns Objeto com startDate e endDate do período de fatura atual
 */
export function getBillingPeriod(
  billingStartDay: number | null,
  billingEndDay: number | null,
  referenceDate: Date = new Date()
): { startDate: Date; endDate: Date } {
  // Se não há configuração de período de fatura, usa o mês calendário
  if (!billingStartDay || !billingEndDay) {
    const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    const monthEnd = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    return { startDate: monthStart, endDate: monthEnd };
  }

  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth();
  const currentDay = referenceDate.getDate();

  // Se o dia atual está entre startDay e endDay (mesmo mês)
  if (currentDay >= billingStartDay && currentDay <= billingEndDay) {
    const startDate = new Date(currentYear, currentMonth, billingStartDay, 0, 0, 0, 0);
    const endDate = new Date(currentYear, currentMonth, billingEndDay, 23, 59, 59, 999);
    return { startDate, endDate };
  }

  // Se o dia atual está antes do startDay, o período atual começou no mês anterior
  if (currentDay < billingStartDay) {
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Ajustar para o último dia do mês anterior se billingEndDay for maior que os dias do mês
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    const endDay = Math.min(billingEndDay, daysInPrevMonth);
    
    const startDate = new Date(prevYear, prevMonth, billingStartDay, 0, 0, 0, 0);
    const endDate = new Date(prevYear, prevMonth, endDay, 23, 59, 59, 999);
    return { startDate, endDate };
  }

  // Se o dia atual está depois do endDay, o período atual começou neste mês e termina no próximo
  if (currentDay > billingEndDay) {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    
    // Ajustar para o último dia do próximo mês se billingEndDay for maior que os dias do mês
    const daysInNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
    const endDay = Math.min(billingEndDay, daysInNextMonth);
    
    const startDate = new Date(currentYear, currentMonth, billingStartDay, 0, 0, 0, 0);
    const endDate = new Date(nextYear, nextMonth, endDay, 23, 59, 59, 999);
    return { startDate, endDate };
  }

  // Fallback: mês calendário
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
  return { startDate: monthStart, endDate: monthEnd };
}

/**
 * Verifica se uma data está dentro do período de fatura de uma conta
 * @param date Data a verificar
 * @param billingStartDay Dia do mês em que inicia a fatura
 * @param billingEndDay Dia do mês em que termina a fatura
 * @returns true se a data está no período de fatura atual
 */
export function isDateInBillingPeriod(
  date: Date,
  billingStartDay: number | null,
  billingEndDay: number | null
): boolean {
  if (!billingStartDay || !billingEndDay) {
    return true; // Se não há configuração, considera todas as datas
  }

  const period = getBillingPeriod(billingStartDay, billingEndDay, date);
  return date >= period.startDate && date <= period.endDate;
}


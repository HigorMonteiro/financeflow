import { z } from 'zod';

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  amount: z
    .string()
    .min(1, 'Valor é obrigatório')
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      },
      { message: 'O valor deve ser maior que zero' }
    ),
  period: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY'], {
    errorMap: () => ({ message: 'Período inválido. Use: WEEKLY, MONTHLY ou YEARLY' }),
  }),
  startDate: z.string().datetime({ message: 'Data de início inválida' }),
});

export const updateBudgetSchema = z.object({
  categoryId: z.string().min(1, 'Categoria é obrigatória').optional(),
  amount: z
    .string()
    .min(1, 'Valor é obrigatório')
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      },
      { message: 'O valor deve ser maior que zero' }
    )
    .optional(),
  period: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY'], {
    errorMap: () => ({ message: 'Período inválido. Use: WEEKLY, MONTHLY ou YEARLY' }),
  }).optional(),
  startDate: z.string().datetime({ message: 'Data de início inválida' }).optional(),
});


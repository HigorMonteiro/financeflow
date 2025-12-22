import { z } from 'zod';
import { GoalType } from '../types/enums';

const goalTypeValues = Object.values(GoalType) as [string, ...string[]];

export const createGoalSchema = z.object({
  name: z.string().min(3, 'O nome da meta deve ter pelo menos 3 caracteres').trim(),
  targetAmount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: 'O valor alvo deve ser maior que zero' }
  ),
  currentAmount: z.string().optional().refine(
    (val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    },
    { message: 'O valor atual não pode ser negativo' }
  ),
  deadline: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val || val === '' || val === null) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: 'Data inválida' }
    ),
  type: z.enum(goalTypeValues, {
    errorMap: () => ({ message: 'Tipo de meta inválido' }),
  }),
});

export const updateGoalSchema = z.object({
  name: z.string().min(3, 'O nome da meta deve ter pelo menos 3 caracteres').trim().optional(),
  targetAmount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: 'O valor alvo deve ser maior que zero' }
  ).optional(),
  currentAmount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    },
    { message: 'O valor atual não pode ser negativo' }
  ).optional(),
  deadline: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val || val === '' || val === null) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: 'Data inválida' }
    ),
  type: z.enum(goalTypeValues, {
    errorMap: () => ({ message: 'Tipo de meta inválido' }),
  }).optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;


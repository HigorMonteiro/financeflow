export const AccountType = {
  CHECKING: 'CHECKING',
  SAVINGS: 'SAVINGS',
  CREDIT_CARD: 'CREDIT_CARD',
  INVESTMENT: 'INVESTMENT',
  CASH: 'CASH',
} as const;

export type AccountType = typeof AccountType[keyof typeof AccountType];

export const CategoryType = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
} as const;

export type CategoryType = typeof CategoryType[keyof typeof CategoryType];

export const TransactionType = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
} as const;

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export const Frequency = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
} as const;

export type Frequency = typeof Frequency[keyof typeof Frequency];

export const GoalType = {
  EMERGENCY_FUND: 'EMERGENCY_FUND',
  TRAVEL: 'TRAVEL',
  PURCHASE: 'PURCHASE',
  INVESTMENT: 'INVESTMENT',
  OTHER: 'OTHER',
} as const;

export type GoalType = typeof GoalType[keyof typeof GoalType];

export const BudgetPeriod = {
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
} as const;

export type BudgetPeriod = typeof BudgetPeriod[keyof typeof BudgetPeriod];


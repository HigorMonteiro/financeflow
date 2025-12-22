import { prisma } from '../config/database';
import { AccountType } from '../types/enums';
import { AppError } from '../middlewares/error.middleware';

export interface CreateAccountDTO {
  name: string;
  type: string;
  balance: string;
  currency: string;
  billingStartDay?: number | null;
  billingEndDay?: number | null;
}

export interface UpdateAccountDTO {
  name?: string;
  type?: string;
  balance?: string;
  currency?: string;
  billingStartDay?: number | null;
  billingEndDay?: number | null;
}

export class AccountService {
  async getAll(userId: string) {
    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: {
        name: 'asc',
      },
    });

    return accounts;
  }

  async getById(userId: string, id: string) {
    const account = await prisma.account.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!account) {
      throw new AppError(404, 'Conta não encontrada');
    }

    return account;
  }

  async create(userId: string, data: CreateAccountDTO) {
    // Validar dias de fatura se fornecidos
    if (data.billingStartDay !== undefined && data.billingStartDay !== null) {
      if (data.billingStartDay < 1 || data.billingStartDay > 31) {
        throw new AppError(400, 'Dia de início da fatura deve estar entre 1 e 31');
      }
    }
    if (data.billingEndDay !== undefined && data.billingEndDay !== null) {
      if (data.billingEndDay < 1 || data.billingEndDay > 31) {
        throw new AppError(400, 'Dia de término da fatura deve estar entre 1 e 31');
      }
    }

    const accountData: any = {
      userId,
      name: data.name,
      type: data.type as AccountType,
      balance: data.balance,
      currency: data.currency,
    };

    if (data.billingStartDay !== undefined) {
      accountData.billingStartDay = data.billingStartDay;
    }
    if (data.billingEndDay !== undefined) {
      accountData.billingEndDay = data.billingEndDay;
    }

    const account = await prisma.account.create({
      data: accountData,
    });

    return account;
  }

  async update(userId: string, id: string, data: UpdateAccountDTO) {
    await this.getById(userId, id);

    // Validar dias de fatura se fornecidos
    if (data.billingStartDay !== undefined && data.billingStartDay !== null) {
      if (data.billingStartDay < 1 || data.billingStartDay > 31) {
        throw new AppError(400, 'Dia de início da fatura deve estar entre 1 e 31');
      }
    }
    if (data.billingEndDay !== undefined && data.billingEndDay !== null) {
      if (data.billingEndDay < 1 || data.billingEndDay > 31) {
        throw new AppError(400, 'Dia de término da fatura deve estar entre 1 e 31');
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.balance !== undefined) updateData.balance = data.balance;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.billingStartDay !== undefined) updateData.billingStartDay = data.billingStartDay;
    if (data.billingEndDay !== undefined) updateData.billingEndDay = data.billingEndDay;

    const updated = await prisma.account.update({
      where: { id },
      data: updateData,
    });

    return updated;
  }

  async delete(userId: string, id: string) {
    await this.getById(userId, id);

    await prisma.account.delete({
      where: { id },
    });
  }
}


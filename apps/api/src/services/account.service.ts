import { prisma } from '../config/database';
import { AccountType } from '../types/enums';
import { AppError } from '../middlewares/error.middleware';

export interface CreateAccountDTO {
  name: string;
  type: string;
  balance: string;
  currency: string;
}

export interface UpdateAccountDTO {
  name?: string;
  type?: string;
  balance?: string;
  currency?: string;
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
    const account = await prisma.account.create({
      data: {
        userId,
        name: data.name,
        type: data.type as AccountType,
        balance: data.balance,
        currency: data.currency,
      },
    });

    return account;
  }

  async update(userId: string, id: string, data: UpdateAccountDTO) {
    await this.getById(userId, id);

    const updated = await prisma.account.update({
      where: { id },
      data,
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


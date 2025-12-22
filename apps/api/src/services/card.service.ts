import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export interface CreateCardDTO {
  name: string;
  bank: string;
  lastFourDigits?: string;
  bestPurchaseDay: number;
  dueDay: number;
  closingDay: number;
  limit?: string;
}

export interface UpdateCardDTO {
  name?: string;
  bank?: string;
  lastFourDigits?: string;
  bestPurchaseDay?: number;
  dueDay?: number;
  closingDay?: number;
  limit?: string;
  isActive?: boolean;
}

export class CardService {
  async getAll(userId: string) {
    return prisma.card.findMany({
      where: { userId },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getById(userId: string, id: string) {
    const card = await prisma.card.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!card) {
      throw new AppError(404, 'Cartão não encontrado');
    }

    return card;
  }

  async create(userId: string, data: CreateCardDTO) {
    // Validar dias (1-31)
    if (data.bestPurchaseDay < 1 || data.bestPurchaseDay > 31) {
      throw new AppError(400, 'Melhor dia para compra deve estar entre 1 e 31');
    }
    if (data.dueDay < 1 || data.dueDay > 31) {
      throw new AppError(400, 'Dia de vencimento deve estar entre 1 e 31');
    }
    if (data.closingDay < 1 || data.closingDay > 31) {
      throw new AppError(400, 'Dia de fechamento deve estar entre 1 e 31');
    }

    return prisma.card.create({
      data: {
        userId,
        name: data.name,
        bank: data.bank,
        lastFourDigits: data.lastFourDigits,
        bestPurchaseDay: data.bestPurchaseDay,
        dueDay: data.dueDay,
        closingDay: data.closingDay,
        limit: data.limit,
      },
    });
  }

  async update(userId: string, id: string, data: UpdateCardDTO) {
    await this.getById(userId, id);

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.bank !== undefined) updateData.bank = data.bank;
    if (data.lastFourDigits !== undefined) updateData.lastFourDigits = data.lastFourDigits;
    if (data.bestPurchaseDay !== undefined) {
      if (data.bestPurchaseDay < 1 || data.bestPurchaseDay > 31) {
        throw new AppError(400, 'Melhor dia para compra deve estar entre 1 e 31');
      }
      updateData.bestPurchaseDay = data.bestPurchaseDay;
    }
    if (data.dueDay !== undefined) {
      if (data.dueDay < 1 || data.dueDay > 31) {
        throw new AppError(400, 'Dia de vencimento deve estar entre 1 e 31');
      }
      updateData.dueDay = data.dueDay;
    }
    if (data.closingDay !== undefined) {
      if (data.closingDay < 1 || data.closingDay > 31) {
        throw new AppError(400, 'Dia de fechamento deve estar entre 1 e 31');
      }
      updateData.closingDay = data.closingDay;
    }
    if (data.limit !== undefined) updateData.limit = data.limit;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return prisma.card.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(userId: string, id: string) {
    await this.getById(userId, id);
    await prisma.card.delete({
      where: { id },
    });
  }
}


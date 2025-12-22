import { prisma } from '../config/database';
import { GoalType } from '../types/enums';
import { AppError } from '../middlewares/error.middleware';

export interface CreateGoalDTO {
  name: string;
  targetAmount: string;
  currentAmount?: string;
  deadline?: string;
  type: GoalType;
}

export interface UpdateGoalDTO {
  name?: string;
  targetAmount?: string;
  currentAmount?: string;
  deadline?: string;
  type?: GoalType;
}

export class GoalService {
  /**
   * Calculate progress percentage for a goal
   */
  private calculateProgress(currentAmount: string, targetAmount: string): number {
    const current = parseFloat(currentAmount);
    const target = parseFloat(targetAmount);
    
    if (target <= 0) return 0;
    
    const progress = (current / target) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }

  /**
   * Get all goals for a user
   */
  async getAll(userId: string) {
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: [
        { deadline: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return goals.map((goal) => ({
      ...goal,
      progress: this.calculateProgress(goal.currentAmount, goal.targetAmount),
    }));
  }

  /**
   * Get a specific goal by ID
   */
  async getById(userId: string, goalId: string) {
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
      },
    });

    if (!goal) {
      throw new AppError(404, 'Meta não encontrada');
    }

    return {
      ...goal,
      progress: this.calculateProgress(goal.currentAmount, goal.targetAmount),
    };
  }

  /**
   * Create a new goal
   */
  async create(userId: string, data: CreateGoalDTO) {
    const targetAmount = parseFloat(data.targetAmount);
    
    if (targetAmount <= 0) {
      throw new AppError(400, 'O valor alvo deve ser maior que zero');
    }

    const currentAmount = data.currentAmount ? parseFloat(data.currentAmount) : 0;
    
    if (currentAmount < 0) {
      throw new AppError(400, 'O valor atual não pode ser negativo');
    }

    if (data.name.trim().length < 3) {
      throw new AppError(400, 'O nome da meta deve ter pelo menos 3 caracteres');
    }

    let deadline: Date | null = null;
    if (data.deadline) {
      deadline = new Date(data.deadline);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      if (deadline < now) {
        throw new AppError(400, 'A data limite não pode ser no passado');
      }
    }

    const goal = await prisma.goal.create({
      data: {
        userId,
        name: data.name.trim(),
        targetAmount: targetAmount.toFixed(2),
        currentAmount: currentAmount.toFixed(2),
        deadline,
        type: data.type,
      },
    });

    return {
      ...goal,
      progress: this.calculateProgress(goal.currentAmount, goal.targetAmount),
    };
  }

  /**
   * Update an existing goal
   */
  async update(userId: string, goalId: string, data: UpdateGoalDTO) {
    const goal = await this.getById(userId, goalId);

    const updateData: any = {};

    if (data.name !== undefined) {
      if (data.name.trim().length < 3) {
        throw new AppError(400, 'O nome da meta deve ter pelo menos 3 caracteres');
      }
      updateData.name = data.name.trim();
    }

    if (data.targetAmount !== undefined) {
      const targetAmount = parseFloat(data.targetAmount);
      if (targetAmount <= 0) {
        throw new AppError(400, 'O valor alvo deve ser maior que zero');
      }
      updateData.targetAmount = targetAmount.toFixed(2);
    }

    if (data.currentAmount !== undefined) {
      const currentAmount = parseFloat(data.currentAmount);
      if (currentAmount < 0) {
        throw new AppError(400, 'O valor atual não pode ser negativo');
      }
      updateData.currentAmount = currentAmount.toFixed(2);
    }

    if (data.deadline !== undefined) {
      if (data.deadline === null || data.deadline === '') {
        updateData.deadline = null;
      } else {
        const deadline = new Date(data.deadline);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        if (deadline < now) {
          throw new AppError(400, 'A data limite não pode ser no passado');
        }
        updateData.deadline = deadline;
      }
    }

    if (data.type !== undefined) {
      updateData.type = data.type;
    }

    const updated = await prisma.goal.update({
      where: { id: goalId },
      data: updateData,
    });

    return {
      ...updated,
      progress: this.calculateProgress(updated.currentAmount, updated.targetAmount),
    };
  }

  /**
   * Delete a goal
   */
  async delete(userId: string, goalId: string) {
    await this.getById(userId, goalId);

    await prisma.goal.delete({
      where: { id: goalId },
    });
  }
}


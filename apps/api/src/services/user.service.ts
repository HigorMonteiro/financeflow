import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import { AppError } from '../middlewares/error.middleware';

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
}

export class UserService {
  async update(userId: string, data: UpdateUserDTO) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'Usuário não encontrado');
    }

    const updateData: any = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.email !== undefined) {
      // Verificar se o email já está em uso por outro usuário
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new AppError(400, 'Email já está em uso');
      }

      updateData.email = data.email;
    }

    if (data.password !== undefined) {
      if (!data.currentPassword) {
        throw new AppError(400, 'Senha atual é obrigatória para alterar a senha');
      }

      const isValidPassword = await bcrypt.compare(data.currentPassword, user.password);

      if (!isValidPassword) {
        throw new AppError(401, 'Senha atual incorreta');
      }

      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return updated;
  }
}


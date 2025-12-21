import { prisma } from '../config/database';
import { CategoryType } from '../types/enums';
import { AppError } from '../middlewares/error.middleware';

export interface CreateCategoryDTO {
  name: string;
  type: string;
  color: string;
  icon: string;
  isDefault?: boolean;
}

export interface UpdateCategoryDTO {
  name?: string;
  type?: string;
  color?: string;
  icon?: string;
}

export class CategoryService {
  async getAll(userId: string) {
    // Buscar categorias do usuário e categorias padrão (isDefault = true)
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId }, // Categorias do usuário
          { isDefault: true }, // Categorias padrão (sem userId)
        ],
      },
      orderBy: [
        { isDefault: 'desc' }, // Categorias padrão primeiro
        { name: 'asc' },
      ],
    });

    return categories;
  }

  async getById(userId: string, id: string) {
    const category = await prisma.category.findFirst({
      where: {
        id,
        OR: [
          { userId }, // Categoria do usuário
          { isDefault: true }, // Categoria padrão
        ],
      },
    });

    if (!category) {
      throw new AppError(404, 'Categoria não encontrada');
    }

    return category;
  }

  async create(userId: string, data: CreateCategoryDTO) {
    // Verificar se já existe uma categoria padrão com o mesmo nome
    if (data.isDefault) {
      const existingDefault = await prisma.category.findFirst({
        where: {
          name: data.name,
          isDefault: true,
        },
      });

      if (existingDefault) {
        throw new AppError(400, 'Já existe uma categoria padrão com este nome');
      }

      // Criar categoria padrão (sem userId)
      const category = await prisma.category.create({
        data: {
          userId: null,
          name: data.name,
          type: data.type as CategoryType,
          color: data.color,
          icon: data.icon,
          isDefault: true,
        },
      });

      return category;
    }

    // Criar categoria do usuário
    const category = await prisma.category.create({
      data: {
        userId,
        name: data.name,
        type: data.type as CategoryType,
        color: data.color,
        icon: data.icon,
        isDefault: false,
      },
    });

    return category;
  }

  async update(userId: string, id: string, data: UpdateCategoryDTO) {
    const category = await this.getById(userId, id);

    // Não permitir editar categorias padrão (apenas admin pode fazer isso)
    if (category.isDefault && category.userId !== userId) {
      throw new AppError(403, 'Não é possível editar categorias padrão do sistema');
    }

    const updated = await prisma.category.update({
      where: { id },
      data,
    });

    return updated;
  }

  async delete(userId: string, id: string) {
    const category = await this.getById(userId, id);

    // Não permitir deletar categorias padrão (apenas admin pode fazer isso)
    if (category.isDefault && category.userId !== userId) {
      throw new AppError(403, 'Não é possível excluir categorias padrão do sistema');
    }

    await prisma.category.delete({
      where: { id },
    });
  }
}


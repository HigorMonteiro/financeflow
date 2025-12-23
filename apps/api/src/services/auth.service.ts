import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../middlewares/error.middleware';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
  token: string;
}

export class AuthService {
  async register(data: RegisterInput): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
    });

    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      token,
    };
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      console.log(`[Auth] Usuário não encontrado: ${data.email}`);
      throw new AppError(401, 'Invalid credentials');
    }

    console.log(`[Auth] Tentativa de login para: ${data.email}`);
    console.log(`[Auth] Senha fornecida (primeiros 3 chars): ${data.password.substring(0, 3)}...`);
    console.log(`[Auth] Hash armazenado (primeiros 20 chars): ${user.password.substring(0, 20)}...`);

    const isValidPassword = await bcrypt.compare(data.password, user.password);

    console.log(`[Auth] Senha válida: ${isValidPassword}`);

    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      token,
    };
  }

  private generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN,
      } as jwt.SignOptions
    );
  }
}


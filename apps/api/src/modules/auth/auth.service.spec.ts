import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    username: 'testuser',
    displayName: 'Test User',
    password: '$2b$10$e8wB6y/Y2nE5mK1o9uK5ueeIq4o17.qL14k7YhG0y8vV9L0XvX8Zq',
    provider: 'LOCAL',
    providerId: null,
    avatarUrl: null,
    bio: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPrismaService = {
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  };

  const mockJwtService = {
    signAsync: vi.fn().mockResolvedValue('mocked-token'),
    verify: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        displayName: mockUser.displayName,
        avatarUrl: null,
        bio: null,
        provider: 'LOCAL',
        createdAt: mockUser.createdAt,
      });

      const result = await service.register({
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        password: 'password123',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.tokens.accessToken).toBe('mocked-token');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email is taken', async () => {
      mockPrismaService.user.findFirst.mockResolvedValueOnce(mockUser);

      await expect(
        service.register({
          email: 'test@example.com',
          username: 'newuser',
          displayName: 'Test User',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if username is taken', async () => {
      mockPrismaService.user.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUser);

      await expect(
        service.register({
          email: 'new@example.com',
          username: 'testuser',
          displayName: 'Test User',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.tokens.accessToken).toBe('mocked-token');
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('googleLogin', () => {
    it('should throw BadRequestException if idToken is empty', async () => {
      await expect(service.googleLogin({ idToken: '' })).rejects.toThrow(BadRequestException);
    });

    it('should login or create user with google oauth idToken', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.googleLogin({ idToken: 'google-mock-token-12345' });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
    });
  });

  describe('appleLogin', () => {
    it('should throw BadRequestException if idToken is empty', async () => {
      await expect(service.appleLogin({ idToken: '' })).rejects.toThrow(BadRequestException);
    });

    it('should login or create user with apple oauth idToken', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.appleLogin({ idToken: 'apple-mock-token-12345' });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
    });
  });

  describe('refreshToken', () => {
    it('should throw UnauthorizedException on invalid token signature', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(
        service.refreshToken({ refreshToken: 'invalid-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should refresh tokens when token matches db hash', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-uuid-1', email: 'test@example.com' });
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      mockPrismaService.refreshToken.findMany.mockResolvedValue([
        { id: 'token-uuid-1', token: 'hashed', expiresAt: futureDate },
      ]);

      const tokens = await service.refreshToken({ refreshToken: 'valid-refresh-token' });

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(mockPrismaService.refreshToken.delete).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should delete user refresh tokens on logout', async () => {
      mockPrismaService.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.logout('user-uuid-1');

      expect(result).toEqual({ success: true });
      expect(mockPrismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
      });
    });
  });
});

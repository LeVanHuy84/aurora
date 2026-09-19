import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { EmotionsService } from './emotions.service.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';

describe('EmotionsService', () => {
  let service: EmotionsService;

  const mockEmotions = [
    {
      id: 'uuid-1',
      code: 'HAPPY',
      label: 'Vui vẻ',
      icon: '😊',
      color: '#F4A261',
      order: 1,
    },
    {
      id: 'uuid-2',
      code: 'CALM',
      label: 'Bình yên',
      icon: '😌',
      color: '#7B9E89',
      order: 2,
    },
  ];

  const mockPrismaService = {
    emotion: {
      findMany: vi.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmotionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EmotionsService>(EmotionsService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return active emotions sorted by order asc', async () => {
      mockPrismaService.emotion.findMany.mockResolvedValue(mockEmotions);

      const result = await service.findAll();

      expect(result).toEqual(mockEmotions);
      expect(mockPrismaService.emotion.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          code: true,
          label: true,
          icon: true,
          color: true,
          order: true,
        },
      });
    });
  });
});

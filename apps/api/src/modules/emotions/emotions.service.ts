import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';

@Injectable()
export class EmotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.emotion.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: 'asc',
      },
      select: {
        id: true,
        code: true,
        label: true,
        icon: true,
        color: true,
        order: true,
      },
    });
  }
}

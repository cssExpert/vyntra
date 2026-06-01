import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto, UpdateModuleDto } from './dto/module.dto';

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.module.findMany({ orderBy: { key: 'asc' } });
  }

  async findOne(id: string) {
    const mod = await this.prisma.module.findUnique({ where: { id } });
    if (!mod) throw new NotFoundException('Module not found');
    return mod;
  }

  async create(dto: CreateModuleDto) {
    const key = dto.key.trim().toUpperCase();
    const existing = await this.prisma.module.findUnique({ where: { key } });
    if (existing) throw new ConflictException('Module key already exists');
    return this.prisma.module.create({
      data: { key, name: dto.name, description: dto.description },
    });
  }

  async update(id: string, dto: UpdateModuleDto) {
    await this.findOne(id);
    return this.prisma.module.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.module.delete({ where: { id } });
    return { success: true };
  }
}

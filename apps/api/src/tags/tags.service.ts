import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TagEntityType } from './tags.types';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Shared, org-scoped tag catalog + assignments. Assignments live in one table
 * discriminated by `entityType` rather than a join table per feature — see
 * TagAssignment in schema.prisma. Since `entityId` is polymorphic (no FK),
 * callers must clean up their own assignments on entity delete via
 * `removeAssignmentsFor` — deleting the Tag itself cascades automatically.
 */
@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async listTags(orgId: string) {
    return this.prisma.tag.findMany({
      where: { organizationId: orgId },
      orderBy: { name: 'asc' },
    });
  }

  async findOrCreateTag(orgId: string, name: string) {
    const slug = slugify(name);
    const existing = await this.prisma.tag.findFirst({
      where: { organizationId: orgId, slug },
    });
    if (existing) return existing;
    return this.prisma.tag.create({
      data: { name, slug, organizationId: orgId },
    });
  }

  async deleteTag(orgId: string, id: string) {
    const tag = await this.prisma.tag.findFirst({ where: { id, organizationId: orgId } });
    if (!tag) throw new NotFoundException('Tag not found');
    await this.prisma.tag.delete({ where: { id } });
    return { ok: true };
  }

  /** Resolves tag names to Tag ids (creating as needed) and replaces the full assignment set for one entity. */
  async syncAssignments(orgId: string, entityType: TagEntityType, entityId: string, tagNames: string[]) {
    const uniqueNames = [...new Set(tagNames.map((n) => n.trim()).filter(Boolean))];
    const tags = await Promise.all(uniqueNames.map((name) => this.findOrCreateTag(orgId, name)));

    await this.prisma.tagAssignment.deleteMany({
      where: { organizationId: orgId, entityType, entityId },
    });
    if (tags.length > 0) {
      await this.prisma.tagAssignment.createMany({
        data: tags.map((tag) => ({ tagId: tag.id, entityType, entityId, organizationId: orgId })),
        skipDuplicates: true,
      });
    }
  }

  /** Batch-attaches `tags: string[]` (names) onto a page of records sharing one entityType. */
  async attachTags<T extends { id: string }>(
    orgId: string,
    entityType: TagEntityType,
    records: T[],
  ): Promise<(T & { tags: string[] })[]> {
    if (records.length === 0) return [];
    const assignments = await this.prisma.tagAssignment.findMany({
      where: { organizationId: orgId, entityType, entityId: { in: records.map((r) => r.id) } },
      include: { tag: true },
    });
    const tagsByEntityId = new Map<string, string[]>();
    for (const a of assignments) {
      const list = tagsByEntityId.get(a.entityId) ?? [];
      list.push(a.tag.name);
      tagsByEntityId.set(a.entityId, list);
    }
    return records.map((r) => ({ ...r, tags: tagsByEntityId.get(r.id) ?? [] }));
  }

  /** Single-record convenience wrapper around `attachTags`. */
  async attachTagsOne<T extends { id: string }>(
    orgId: string,
    entityType: TagEntityType,
    record: T,
  ): Promise<T & { tags: string[] }> {
    const [withTags] = await this.attachTags(orgId, entityType, [record]);
    return withTags;
  }

  async removeAssignmentsFor(orgId: string, entityType: TagEntityType, entityId: string) {
    await this.prisma.tagAssignment.deleteMany({
      where: { organizationId: orgId, entityType, entityId },
    });
  }
}

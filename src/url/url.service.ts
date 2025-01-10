import {
  Injectable,
  NotFoundException,
  GoneException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateUrlDto } from './dto/create-url.dto';

@Injectable()
export class UrlService {
  constructor(private prisma: PrismaService) {}

  async createShortUrl(createUrlDto: CreateUrlDto) {
    const shortUrl = this.generateShortUrl(createUrlDto.alias);

    const existingUrl = await this.prisma.url.findUnique({
      where: { shortUrl },
    });

    if (existingUrl) {
      throw new ConflictException('Alias is already in use');
    }

    const expiresAt = createUrlDto.expiresAt
      ? new Date(createUrlDto.expiresAt)
      : null;

    return this.prisma.url.create({
      data: {
        originalUrl: createUrlDto.originalUrl,
        shortUrl,
        expiresAt,
      },
    });
  }

  async getOriginalUrl(shortUrl: string, ipAddress?: string): Promise<string> {
    const url = await this.prisma.url.findUnique({ where: { shortUrl } });

    if (!url) throw new NotFoundException('URL not found');

    if (url.expiresAt && new Date() > url.expiresAt) {
      throw new GoneException('URL has expired');
    }

    await this.prisma.url.update({
      where: { shortUrl },
      data: { clickCount: { increment: 1 } },
    });

    await this.prisma.urlVisit.create({
      data: {
        ipAddress,
        urlId: url.id,
      },
    });

    return url.originalUrl;
  }

  async getUrlInfo(shortUrl: string) {
    const url = await this.prisma.url.findUnique({ where: { shortUrl } });
    if (!url) throw new NotFoundException('URL not found');
    return url;
  }

  async deleteShortUrl(shortUrl: string) {
    const url = await this.prisma.url.findUnique({ where: { shortUrl } });
    if (!url) throw new NotFoundException('URL not found');
    await this.prisma.url.delete({ where: { shortUrl } });
  }

  private generateShortUrl(alias: string | undefined): string {
    let shortUrl = alias ?? Math.random().toString(36).substring(2, 8);
    return shortUrl;
  }

  async getUrlVisits(shortUrl: string) {
    const url = await this.prisma.url.findUnique({
      where: { shortUrl },
      include: {
        visits: {
          orderBy: {
            visitedAt: 'desc',
          },
          take: 5,
        },
      },
    });

    if (!url) throw new NotFoundException('URL not found');

    return {
      clickCount: url.clickCount,
      recentIPs: url.visits.map((visit) => visit.ipAddress),
    };
  }
}

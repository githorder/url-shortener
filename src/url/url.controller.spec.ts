import {
  BadRequestException,
  ConflictException,
  GoneException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { PrismaService } from '../prisma/prisma.service';

import { CreateUrlDto } from './dto/create-url.dto';

describe('UrlController', () => {
  let controller: UrlController;
  let service: UrlService;
  let prismaService: PrismaService;
  let res: Partial<Response>;
  let req: Partial<Request>;

  beforeEach(() => {
    prismaService = new PrismaService();
    service = new UrlService(prismaService);
    controller = new UrlController(service);

    res = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    req = {
      ip: '127.0.0.1',
    };
  });

  it('should create a short URL with a unique alias', async () => {
    const dto: CreateUrlDto = {
      originalUrl: 'http://example.com',
      alias: 'customAlias',
    };

    const result = {
      id: '1',
      shortUrl: 'customAlias',
      originalUrl: 'http://example.com',
      createdAt: new Date(),
      clickCount: 0,
      expiresAt: null,
    };

    jest
      .spyOn(service, 'createShortUrl')
      .mockImplementation(async () => result);

    expect(await controller.createShortUrl(dto)).toEqual({
      message: 'URL created successfully',
      data: result,
    });
  });

  it('should throw an error if alias is already in use', async () => {
    const dto: CreateUrlDto = {
      originalUrl: 'http://example.com',
      alias: 'customAlias',
    };

    jest
      .spyOn(service, 'createShortUrl')
      .mockRejectedValue(new ConflictException('Alias is already in use'));

    await expect(controller.createShortUrl(dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should redirect to the original URL if found', async () => {
    const originalUrl = 'http://example.com';

    jest
      .spyOn(service, 'getOriginalUrl')
      .mockImplementation(async () => originalUrl);

    await controller.redirectToOriginal(
      'customAlias',
      res as Response,
      req as Request,
    );

    expect(res.redirect).toHaveBeenCalledWith(originalUrl);
  });

  it('should return 410 GONE if URL has expired', async () => {
    jest
      .spyOn(service, 'getOriginalUrl')
      .mockRejectedValue(new GoneException('URL has expired'));

    await controller.redirectToOriginal(
      'urlHasExpired',
      res as Response,
      req as Request,
    );

    expect(res.status).toHaveBeenCalledWith(HttpStatus.GONE);
    expect(res.send).toHaveBeenCalledWith({ message: 'URL has expired' });
  });

  it('should return 404 NOT FOUND if URL is not found', async () => {
    jest
      .spyOn(service, 'getOriginalUrl')
      .mockRejectedValue(new NotFoundException('URL not found'));

    await controller.redirectToOriginal(
      'notfoundUrl',
      res as Response,
      req as Request,
    );

    expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith({ message: 'URL not found' });
  });
});

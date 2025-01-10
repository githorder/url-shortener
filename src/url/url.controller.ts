import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Req,
  Res,
  GoneException,
  HttpStatus,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';

import { validation } from '../../utils';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('/shorten')
  async createShortUrl(@Body() createUrlDto: CreateUrlDto) {
    try {
      await validation(CreateUrlDto, createUrlDto);

      const url = await this.urlService.createShortUrl(createUrlDto);
      return {
        message: 'URL created successfully',
        data: url,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get('/:shortUrl')
  async redirectToOriginal(
    @Param('shortUrl') shortUrl: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip;

    try {
      const originalUrl = await this.urlService.getOriginalUrl(
        shortUrl,
        ipAddress,
      );
      res.redirect(originalUrl);
    } catch (error) {
      if (error instanceof GoneException) {
        res.status(HttpStatus.GONE).send({ message: 'URL has expired' });
      } else {
        res.status(HttpStatus.NOT_FOUND).send({ message: 'URL not found' });
      }
    }
  }

  @Get('/info/:shortUrl')
  async getUrlInfo(@Param('shortUrl') shortUrl: string) {
    return this.urlService.getUrlInfo(shortUrl);
  }

  @Get('/analytics/:shortUrl')
  async getUrlAnalytics(@Param('shortUrl') shortUrl: string) {
    return this.urlService.getUrlVisits(shortUrl);
  }

  @Delete('/delete/:shortUrl')
  async deleteShortUrl(@Param('shortUrl') shortUrl: string) {
    await this.urlService.deleteShortUrl(shortUrl);
    return { message: 'URL deleted successfully' };
  }
}

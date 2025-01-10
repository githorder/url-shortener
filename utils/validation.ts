import { BadRequestException } from '@nestjs/common';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateUrlDto } from 'src/url/dto/create-url.dto';

export default async function validation(
  dto: ClassConstructor<object>,
  body: object,
) {
  const dtoObject = plainToClass(dto, body);

  const errors = await validate(dtoObject);

  if (errors.length > 0) {
    throw new BadRequestException(
      'Validation failed: ' +
        errors.map((err) => Object.values(err.constraints)).join(', '),
    );
  }
}

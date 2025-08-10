import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Country } from '@prisma/client';
import { CreateCountryDto } from './dtos/create-country.dto';
import { CustomException, EXCEPTION_STATUS } from '../common/custom-exception';

@Injectable()
export class CountriesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCountry(createCountryDto: CreateCountryDto): Promise<Country> {
    createCountryDto.englishName = createCountryDto.englishName ?? null;
    const country = await this.prisma.country.findUnique({
      where: { countryCode: createCountryDto.countryCode }
    });
    if (country) {
      throw new CustomException(EXCEPTION_STATUS.COUNTRY.ALREADY_EXISTS);
    }
    return this.prisma.country.create({
      data: {
        ...createCountryDto
      }
    })
  }

  async findCountryByCountryCode(countryCode: string):Promise<Country> {
    return this.prisma.country.findUnique({
      where: { countryCode: countryCode }
    })
  }
}

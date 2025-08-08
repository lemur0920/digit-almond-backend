import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Country } from '@prisma/client';
import { CreateCountryDto } from './dtos/create-country.dto';

@Injectable()
export class CountriesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCountry(createCountryDto: CreateCountryDto): Promise<Country> {
    const { countryCode, koreanName, englishName } = createCountryDto;
    return this.prisma.country.create({
      data: {
        countryCode,
        koreanName,
        englishName: englishName ?? null // null safety, no sql에서는 값이 없을 경우 아예 필드 자체가 생성이 안 됨.
      }
    })
  }

  async findCountryByCountryCode(countryCode: string):Promise<Country> {
    return this.prisma.country.findUnique({
      where: { countryCode: countryCode }
    })
  }
}

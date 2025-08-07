import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Country } from '@prisma/client';

@Injectable()
export class CountriesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCountry(createCountryDto: CreateCountryDto): Promise<Country> {
    return this.prisma.country.create()
  }
}

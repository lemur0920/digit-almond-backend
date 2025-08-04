import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCityDto } from './dtos/create-city.dto';
import { City, Prisma } from '@prisma/client';
import { CustomException, EXCEPTION_STATUS } from '../common/custom-exception';

@Injectable()
export class CitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findCityByCityCode(cityCode: number): Promise<City> {
    const city = await this.prisma.city.findUnique({
      where: { cityCode: cityCode }
    })
    return city;
  }

  async findAllCities(): Promise<City[]> {
    const cities = await this.prisma.city.findMany();
    return cities;
  }

  private async getNextCityCode():Promise<number> {
    const lastCity = await this.prisma.city.findFirst({
      orderBy: { cityCode: Prisma.SortOrder.desc },
    });

    return lastCity ? lastCity.cityCode + 1 : 1;
  }

  async createCity(createCityDto: CreateCityDto): Promise<City> {
    const countryExists = await this.prisma.country.findUnique({
      where: { id: createCityDto.countryCode }
    });
    const cityExists = await this.prisma.city.findUnique({
      where: {
        countryCode_name: {
          countryCode: createCityDto.countryCode,
          name: createCityDto.name,
        }
      }
    });

    if (!countryExists) {
      throw new CustomException(EXCEPTION_STATUS.COUNTRY.NOT_EXISTS);
    }

    if (cityExists) {
      throw new CustomException(EXCEPTION_STATUS.CITY.ALREADY_EXISTS);
    }

    const nextCityCode = await this.getNextCityCode();

    return this.prisma.city.create({
      data: {
        ...createCityDto,
        cityCode: nextCityCode,
      }
    })
  }
}

import { Body, Controller, Get, Post } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dtos/create-city.dto';
import { City } from '@prisma/client';
import { ResponseDto } from '../common/response.dto';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  async createCity(@Body() createCityDto: CreateCityDto):Promise<City> {
    return this.citiesService.createCity(createCityDto);
  }

  @Get()
  async findAllCities(): Promise<ResponseDto<City[]>>{
    // return this.citiesService.findAllCities();
    const cities = this.citiesService.findAllCities();
    return ResponseDto.success({
      message: '전체 도시 조회 성공',
      data: await cities
      }
    )
  }
}

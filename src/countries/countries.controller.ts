import { Body, Controller, Post } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { ResponseDto } from '../common/response.dto';
import { Country } from '@prisma/client';
import { CreateCountryDto } from './dtos/create-country.dto';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post('')
  async createCountry(@Body() createCountryDto: CreateCountryDto): Promise<ResponseDto<Country>> {
    const newCountry = await this.countriesService.createCountry(createCountryDto);
    return ResponseDto.success({
      message: '국가 생성 성공',
      data: newCountry
    })
  }
}

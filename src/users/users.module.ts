import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CitiesService } from '../cities/cities.service';
import { CitiesModule } from '../cities/cities.module';
import { UsersRepository } from './users.repository';
import { CountriesModule } from '../countries/countries.module';

@Module({
  imports: [CitiesModule, CountriesModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository]
})
export class UsersModule {}

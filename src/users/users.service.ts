import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { CitiesService } from '../cities/cities.service';
import { CustomException, EXCEPTION_STATUS } from '../common/custom-exception';
import * as bcrypt from 'bcrypt';
import { Profile, User } from '@prisma/client';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersRepository: UsersRepository,
    private readonly citiesService: CitiesService
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.password !== createUserDto.password2) {
      throw new CustomException(EXCEPTION_STATUS.AUTH.UNMATCHED_PASSWORD);
    }
    const existingUser = await this.usersRepository.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new CustomException(EXCEPTION_STATUS.USER.ALREADY_EXISTS);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    const city = await this.citiesService.findCityByCityCode(createUserDto.cityCode);

    if (!city) {
      throw new CustomException(EXCEPTION_STATUS.CITY.NOT_EXISTS);
    }

    const { password2, ...userData } = createUserDto;
    console.log(userData)
    return this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        cityCode: city.cityCode,
        firstLoginAt: null
      }
    })
  }

  async createProfile(userId: string, createProfileDto: CreateProfileDto): Promise<Profile> {
    return this.prisma.profile.create({
      data: {
        ...createProfileDto,
        userId: userId
      }
    })
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

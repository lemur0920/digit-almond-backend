import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { CitiesService } from '../cities/cities.service';
import { CustomException, EXCEPTION_STATUS } from '../common/custom-exception';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly citiesService: CitiesService
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.password !== createUserDto.password2) {
      throw new CustomException(EXCEPTION_STATUS.AUTH.UNMATCHED_PASSWORD);
    }
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new CustomException(EXCEPTION_STATUS.USER.ALREADY_EXISTS);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    const city = await this.citiesService.findByCityCode(createUserDto.cityCode);
    if (!city) {
      throw new CustomException(EXCEPTION_STATUS.CITY.NOT_EXISTS);
    }

    const { password2, ...userData } = createUserDto;

    return this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        cityCode: city.cityCode,
      }
    })
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email: email }
    })
    return user;
  }

  async createProfile(id: string, ) {

  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

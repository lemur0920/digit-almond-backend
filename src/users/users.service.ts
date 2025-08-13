import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { CitiesService } from '../cities/cities.service';
import { CustomException, EXCEPTION_STATUS } from '../common/custom-exception';
import * as bcrypt from 'bcrypt';
import { Profile, User } from '@prisma/client';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { UsersRepository } from './users.repository';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { CountriesService } from '../countries/countries.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersRepository: UsersRepository,
    private readonly citiesService: CitiesService,
    private readonly countriesService: CountriesService
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
    const country = await this.countriesService.findCountryByCountryCode(createUserDto.countryCode);
    if(!country) {
      throw new CustomException(EXCEPTION_STATUS.COUNTRY.NOT_EXISTS);
    }

    const { password2, ...userData } = createUserDto;

    userData.countryCode = country.countryCode;
    userData.cityCode = city.cityCode;
    userData.password = hashedPassword;

    return this.prisma.user.create({
      data: {
        ...userData,
        firstLoginAt: null
      }
    })
  }
  async createProfile(userId: string, createProfileDto: CreateProfileDto, filePath: string): Promise<Profile> {
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId: userId }
    });

    if (existingProfile) {
      throw new CustomException(EXCEPTION_STATUS.PROFILE.ALREADY_EXISTS);
    }

    return this.prisma.profile.create({
      data: {
        ...createProfileDto,
        user: {
          connect: { id:userId },
        }
      }
    })
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    return this.prisma.profile.update({
      where: { userId: userId },
      data: updateProfileDto
    })
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new CustomException(EXCEPTION_STATUS.USER.NOT_FOUND);
    }

    const isPasswordValid = await this.validatePassword(changePasswordDto.password1, user.password);

    if (!isPasswordValid) {
      throw new CustomException(EXCEPTION_STATUS.AUTH.INVALID_PASSWORD);
    }

    const hashedNewPassword = await bcrypt.hash(changePasswordDto.password2, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });
  }
}

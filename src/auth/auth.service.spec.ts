import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { RedisService } from '../redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { CustomException } from '../common/custom-exception';

describe('AuthService', () => {
  let authService: AuthService;
  let redisService: RedisService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: RedisService,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: UsersRepository,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            validatePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    redisService = module.get<RedisService>(RedisService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should generate a refresh token and store it in Redis', async () => {
    const mocker = { id: '123', email: 'test@example.com' };
    const mockToken = 'mockRefreshToken';

    jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);
    jest.spyOn(redisService, 'set').mockResolvedValue(undefined);

    const result = await authService.generateRefreshToken(mockUser as any);

    expect(jwtService.sign).toHaveBeenCalledWith(
      { sub: mockUser.id },
      { expiresIn: '7d' },
    );
    expect(redisService.set).toHaveBeenCalledWith(
      `refreshToken:${mockUser.id}`,
      mockToken,
      7 * 24 * 60 * 60,
    );
    expect(result).toBe(mockToken);

    it('should throw an error if refresh token is invalid', async () => {
      const mockToken = 'invalidToken';

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(authService.refreshAccessToken(mockToken)).rejects.toThrow(CustomException,)
    })

    it('should refresh access token if refresh token is valid', async () => {
      const mockUser = { id: '123', email: 'test@exmaple.com' };
      const mockRefreshToken = 'validRefreshToken';
      const mockAccessToken = 'newAccessToken';
      const mockNewRefreshToken = 'newRefreshToken';

      jest.spyOn(jwtService, 'verify').mockReturnValue({ sub: mockUser.id });
      jest.spyOn(redisService, 'get').mockResolvedValue(mockRefreshToken);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(mockAccessToken).mockReturnValueOnce(mockNewRefreshToken);
      jest.spyOn(redisService, 'set').mockResolvedValue(undefined);

      const result = await authService.refreshAccessToken(mockRefreshToken);

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockNewRefreshToken,
      });
    });
  });
});

import { Controller, Get, Req } from '@nestjs/common';
import { AlarmsService } from './alarms.service';
import { ResponseDto } from '../common/response.dto';
import { Alarm } from '@prisma/client';

@Controller('alarms')
export class AlarmsController {
  constructor(private readonly alarmsService: AlarmsService) {};

  @Get()
  async getAlarms(
    @Req() req: any
  ):Promise<ResponseDto<Alarm[]>> {
    const userId = req.user.userId;
    const alarms = await this.alarmsService.getAlarms(userId);

    return ResponseDto.success({
      message: '알람 전체 조회 성공',
      data: alarms
    })
  }
}

import { Controller, Delete, Get, Param, Req } from '@nestjs/common';
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

  @Delete(':alarmId')
  async deleteAlarm(
    @Req() req: any,
    @Param('alarmId') alarmId: string
  ): Promise<ResponseDto<null>> {
    const userId = req.user.userId;
    const alarm = await this.alarmsService.deleteAlarms(alarmId, userId);
    
    return ResponseDto.success({
      message: '알람 삭제 성공',
      data: null
    })
  }
}

import { Controller, Get, Res } from '@nestjs/common';

@Controller('consul')
export class HealthCheckController {
  @Get('health-check')
  health(@Res() res) {
    res.send('OK');
  }
}

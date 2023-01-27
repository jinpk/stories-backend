import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkResponsePaginated } from 'src/common/decorators/response.decorator';
import { GetSubscriptionsDto } from './dto/get-subscription.dto';
import { SubscriptionsDto } from './dto/subscription.dto';
import { VerifySubscriptionDto } from './dto/verify-subscription.dto';

@Controller('subscriptions')
@ApiTags('subscriptions')
@ApiBearerAuth()
export class SubscriptionsController {
  @Post('verify')
  @ApiOperation({
    summary: '구독 검증',
    description: `신규 구독은 검증후 구독 데이터 생성
    \n구독 갱신은 body.transactionId를 체크후 업데이트`,
  })
  verifySubscription(@Body() body: VerifySubscriptionDto) {}

  @Get('')
  @ApiOperation({
    summary: '결제 내역 조회',
  })
  @ApiOkResponsePaginated(SubscriptionsDto)
  listSubscriptions(@Query() query: GetSubscriptionsDto) {}
}

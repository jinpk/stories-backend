import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { ApiOkResponsePaginated } from 'src/common/decorators/response.decorator';
import { GetSubscriptionsDto } from './dto/get-subscription.dto';
import { SubscriptionsDto } from './dto/subscription.dto';
import { VerifySubscriptionDto } from './dto/verify-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
@ApiTags('subscriptions')
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  // @Post('verify')
  // @ApiOperation({
  //   summary:
  //     '(사용 불가능) 구독 첫 결졔(검증) | 갱신 | 다운그레이드 | 취소 | 업그레이드',
  //   description: `신규 구독은 검증후 구독 데이터 생성
  //   \n구독 갱신은 body.transactionId를 체크후 업데이트
  //   \n사용자가 앱 시작하는 시점에 각 OS에서 스토어 연결된 API로 구독 상태 가져와서 갱신되었다면 서버에 요청
  //   \n(앱 특성상 서버에서 스케쥴러 안돌려도 될 것 같아 위와 같이 처리함.)
  //   \n그 외 다운/업그레이드 및 취소 액션이 일어나면 해당 API호출
  //   \n(호출시 서버에서 각 OS 서버로 결제 검증하여 업데이트 함)`,
  // })
  // @ApiOkResponse({
  //   status: 200,
  //   type: String,
  // })
  // async verifySubscription(@Body() body: VerifySubscriptionDto) {
  //   await this.subscriptionsService.verify(body);
  // }

  // @Get('')
  // @ApiOperation({
  //   summary: '결제 내역 조회',
  // })
  // @ApiOkResponsePaginated(SubscriptionsDto)
  // async listSubscriptions(
  //   @Query() query: GetSubscriptionsDto,
  //   @Request() req
  //   ) {
  //   if (!req.user.isAdmin) {
  //     if (query.userId != req.user.id) {
  //       throw new Error('인증 실패')
  //     } else {
  //       return await this.subscriptionsService.findListSubscription(query);
  //     }
  //   } else {
  //     return await this.subscriptionsService.findListSubscription(query);
  //   }
  // }
}

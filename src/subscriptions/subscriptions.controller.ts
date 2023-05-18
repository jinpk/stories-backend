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

  @Post('verify')
  @ApiOperation({
    summary: '구독 첫 결졔(검증) | 갱신 | 다운그레이드 | 취소 | 업그레이드',
    description: `1. summary의 모든 액션이 있을때마다 페이로드를 보내서 서버에 검증 요청을합니다.
    \n2. 서버에서는 페이로드를 받아 직접 앱스토어 | 플레이스토어로 구독 결제 상태를 확인합니다.
    \n3. 구독상태가 정상인 경우와 비정상인 경우(취소|해지), 업그레이드 처리로 스토리즈 유저의 구독 상태를 업데이트합니다.
    \n\n신규 구독은 검증후 구독 데이터 생성
    \n사용자가 앱 시작하는 시점에 각 OS에서 스토어 연결된 API로 구독 상태 가져와서 갱신되었다면 서버에 요청
    \n(모든 유형 앱에서 이벤트 받을 수 있고 데이터 가공하여 API 호출)
    \n(호출시 서버에서 각 OS 서버로 결제 검증하여 업데이트 함)
    \n\n
    쿠폰은 첫 결제에 단 한번만 보내면 됩니다.
    `,
  })
  async verifySubscription(@Body() body: VerifySubscriptionDto) {
    await this.subscriptionsService.verify(body);
  }

  @Get('')
  @ApiOperation({
    summary: '결제 내역 조회',
  })
  @ApiOkResponsePaginated(SubscriptionsDto)
  async listSubscriptions(
    @Query() query: GetSubscriptionsDto,
    @Request() req
    ) {
    if (!req.user.isAdmin) {
      if (query.userId != req.user.id) {
        throw new Error('인증 실패')
      } else {
        return await this.subscriptionsService.findListSubscription(query);
      }
    } else {
      return await this.subscriptionsService.findListSubscription(query);
    }
  }
}

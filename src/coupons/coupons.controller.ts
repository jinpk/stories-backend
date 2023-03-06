import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiOkResponsePaginated } from 'src/common/decorators/response.decorator';
import { CouponsService } from './coupons.service';
import { CouponDto } from './dto/coupon.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { GetCouponsDto, GetCouponsSentDto } from './dto/get-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CreateUserCouponDto, UserCouponDto } from './dto/user-coupon.dto';

@Controller('coupons')
@ApiTags('coupons')
@ApiBearerAuth()
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}
  @Post('sent')
  @ApiOperation({ summary: '쿠폰 발송' })
  async couponSent(@Body() body: CreateUserCouponDto) {
    if (!(await this.couponsService.existCouponById(body.couponId))) {
      throw new NotFoundException('NotFound Coupon');
    }

    await this.couponsService.sentCouponToUsers(body);
  }

  @Get('sent')
  @ApiOperation({
    summary: '쿠폰 발송 내역',
    description:
      'userId 입력시 회원 쿠폰 내역 조회 (앱에서 조회시 used = 1 고정으로 요청 필요)',
  })
  @ApiOkResponsePaginated(UserCouponDto)
  async listCouponSent(@Query() query: GetCouponsSentDto) {
    return await this.couponsService.getPagingCouponSentList(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '쿠폰 상세 조회' })
  @ApiOkResponse({ type: CouponDto })
  async getCoupon(@Param('id') id: string) {
    if (!(await this.couponsService.existCouponById(id))) {
      throw new NotFoundException('NotFound Coupon');
    }
    return await this.couponsService.getCouponById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '쿠폰 삭제' })
  async deleteCoupon(@Param('id') id: string) {
    if (!(await this.couponsService.existCouponById(id))) {
      throw new NotFoundException('NotFound Coupon');
    }
    return await this.couponsService.deleteCoupon(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: '쿠폰 수정',
    description:
      ':id(GET)에서 받아온 값 default, 사용자가 수정한 값 반영하여 전체 payload 요청',
  })
  async updateCoupon(@Param('id') id: string, @Body() body: UpdateCouponDto) {
    if (!(await this.couponsService.existCouponById(id))) {
      throw new NotFoundException('NotFound Coupon');
    }
    return await this.couponsService.updateCoupon(id, body);
  }

  @Post('')
  @ApiOperation({ summary: '쿠폰 등록' })
  async createCoupon(@Body() body: CreateCouponDto) {
    return await this.couponsService.createCounpon(body);
  }

  @Get('')
  @ApiOperation({ summary: '쿠폰 조회' })
  @ApiOkResponsePaginated(CouponDto)
  async listCoupon(@Query() query: GetCouponsDto) {
    return await this.couponsService.getPagingCoupons(query);
  }
}

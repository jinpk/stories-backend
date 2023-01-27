import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CouponDto } from './dto/coupon.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { GetCouponsDto } from './dto/get-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CreateUserCouponDto, UserCouponDto } from './dto/user-coupon.dto';

@Controller('coupons')
@ApiTags('coupons')
@ApiBearerAuth()
export class CouponsController {
  @Post('sent')
  @ApiOperation({ summary: '쿠폰 발송' })
  couponSent(@Body() body: CreateUserCouponDto) {}

  @Get('sent')
  @ApiOperation({ summary: '쿠폰 발송 내역' })
  @ApiOkResponsePaginated(UserCouponDto)
  listCouponSent(@Query() qeury: GetCouponsDto) {}

  @Get(':id')
  @ApiOperation({ summary: '쿠폰 상세조회' })
  @ApiOkResponse({ type: CouponDto })
  getCoupon(@Param('id') id: string) {}

  @Delete(':id')
  @ApiOperation({ summary: '쿠폰 삭제' })
  deleteCoupon(@Param('id') id: string) {}

  @Put(':id')
  @ApiOperation({ summary: '쿠폰 수정' })
  updateCoupon(@Param('id') id: string, @Body() body: UpdateCouponDto) {}

  @Post('')
  @ApiOperation({ summary: '쿠폰 등록' })
  createCoupon(@Body() body: CreateCouponDto) {}

  @Get('')
  @ApiOperation({ summary: '쿠폰 조회' })
  @ApiOkResponsePaginated(CouponDto)
  listCoupon(@Query() qeury: GetCouponsDto) {}
}

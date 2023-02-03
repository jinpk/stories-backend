import {
    Controller,
    Get,
    Param,
    Delete,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import { ApiOkResponsePaginated } from 'src/common/decorators/response.decorator';
import { ReminderDto } from './dto/reminder.dto';
import { ReminderService } from './reminder.service';

@Controller('reminder')
@ApiTags('reminder')
@ApiBearerAuth()
export class ReminderController {
    constructor(private readonly reminderService: ReminderService) {}
    @Post('')
    @ApiOperation({
      summary: '사용자 리마인더 등록',
    })
    @ApiBody({
        type:ReminderDto,
      })
    async createReminder(@Query('userId') userId: string) {
    }

    @Patch(':reminder_id')
    @ApiOperation({
      summary: '사용자 리마인더 수정',
    })
    @ApiBody({
        type:ReminderDto,
      })
    async patchReminder(@Query('userId') userId: string, @Param('reminder_id') reminder_id: string) {
    }

    @Delete(':reminder_id')
    @ApiOperation({
      summary: '사용자 리마인더 삭제',
    })
    async deleteReminder(@Query('userId') userId: string, @Param('reminder_id') reminder_id: string) {
    }
}

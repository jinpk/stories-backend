import { ApiProperty } from '@nestjs/swagger';

export type DayTime = "AM" | "PM"

export class ReminderDto{
    @ApiProperty({})
    userId: string;

    @ApiProperty({})
    daytime: DayTime;

    @ApiProperty({})
    hour: number;

    @ApiProperty({})
    minute: number;

    @ApiProperty({})
    day: string[];
}

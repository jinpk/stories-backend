import { ApiProperty } from '@nestjs/swagger';

export class VocabTestDto {
  @ApiProperty({})
  serial_number: string;

  @ApiProperty({})
  user_selected_number: number;

  @ApiProperty({})
  user_selected_vocab: string;
}

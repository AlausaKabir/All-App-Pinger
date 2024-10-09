import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterEmailDto {
  @ApiProperty({ example: 'you@gmail.com' })
  @IsString()
  @IsNotEmpty()
  email: string;
}

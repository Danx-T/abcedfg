import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateActorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  biography?: string;

  @IsString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  nationality?: string;
}
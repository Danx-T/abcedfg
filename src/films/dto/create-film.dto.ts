import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsUrl } from 'class-validator';

export class CreateFilmDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  genre: string;

  @IsNumber()
  @IsNotEmpty()
  releaseYear: number;

  @IsString()
  @IsNotEmpty()
  director: string;

  @IsNumber()
  @IsNotEmpty()
  imdbRating?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsUrl()
  @IsNotEmpty()
  posterUrl?: string;

  @IsArray()
  @IsOptional()
  filmActors?: number[]; // Actor ID'leri array olarak
}
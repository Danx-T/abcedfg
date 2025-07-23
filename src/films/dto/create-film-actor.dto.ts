import { IsNumber } from 'class-validator';

export class CreateFilmActorDto {
  @IsNumber()
  actorId: number;

  @IsNumber()
  filmId: number;
}
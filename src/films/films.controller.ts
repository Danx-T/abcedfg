import { Controller, Get, Param, Query } from '@nestjs/common';
import { FilmsService } from './films.service';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  // Tüm filmleri listele
  @Get()
  getAllFilms() {
    return this.filmsService.findAllFilms();
  }

  // Belirli aktörün filmlerini listele (actorId query param ile)
  @Get('by-actor')
  getFilmsByActor(@Query('actorId') actorId: number) {
    return this.filmsService.findFilmsByActor(actorId);
  }

  // Tüm aktörleri listele
  @Get('/actors')
  getAllActors() {
    return this.filmsService.findAllActors();
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { Actor } from './entities/actor.entity';
import { Film } from './entities/film.entity';
import { FilmActor } from './entities/film-actor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Actor, Film, FilmActor], 'filmsConnection'),
  ],
  controllers: [FilmsController],
  providers: [FilmsService],
  exports: [FilmsService],
})
export class FilmsModule {}

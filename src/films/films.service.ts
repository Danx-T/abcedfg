import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Film } from './entities/film.entity';
import { Actor } from './entities/actor.entity';
import { FilmActor } from './entities/film-actor.entity';

@Injectable()
export class FilmsService {
  constructor(
    @InjectRepository(Film, 'filmsConnection')
    private filmRepository: Repository<Film>,

    @InjectRepository(Actor, 'filmsConnection')
    private actorRepository: Repository<Actor>,

    @InjectRepository(FilmActor, 'filmsConnection')
    private filmActorRepository: Repository<FilmActor>,
  ) {}

  // Tüm filmler
  async findAllFilms(): Promise<Film[]> {
    return this.filmRepository.find();
  }

  // Tüm aktörler
  async findAllActors(): Promise<Actor[]> {
    return this.actorRepository.find();
  }

  // Aktöre göre filmleri getir (join ile)
  async findFilmsByActor(actorId: number): Promise<Film[]> {
    const filmActors = await this.filmActorRepository.find({
      where: { actor: { id: actorId } },
      relations: ['film'], // film bilgisini dahil et
    });

    return filmActors.map(fa => fa.film);
  }
}

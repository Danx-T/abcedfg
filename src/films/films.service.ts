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

  // Aktöre göre filmleri getir (QueryBuilder ile)
  async findFilmsByActor(actorId: number): Promise<Film[]> {
    return this.filmRepository
      .createQueryBuilder('film')
      .innerJoin('film.filmActors', 'filmActor')
      .innerJoin('filmActor.actor', 'actor')
      .where('actor.id = :actorId', { actorId })
      .getMany();
}
}

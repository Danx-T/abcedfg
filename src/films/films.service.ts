import {
  Injectable,
  NotFoundException,
  ConflictException, // ✅ EKLENDİ
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Film } from './entities/film.entity';
import { Actor } from './entities/actor.entity';
import { FilmActor } from './entities/film-actor.entity';
import { CreateFilmActorDto } from './dto/create-film-actor.dto'; // ✅ EKLENDİ

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
    return this.filmRepository.find({
      relations: ['filmActors', 'filmActors.actor'],
    });
  }

  // Tüm aktörler
  async findAllActors(): Promise<Actor[]> {
    return this.actorRepository.find();
  }

  // Aktöre göre filmleri getir
  async findFilmsByActor(actorId: number): Promise<Film[]> {
    const filmActors = await this.filmActorRepository.find({
      where: { actor: { id: actorId } },
      relations: ['film'],
    });

    return filmActors.map((fa) => fa.film);
  }

  // Film detay getir
  async findOneFilm(id: number): Promise<Film> {
    const film = await this.filmRepository.findOne({
      where: { id },
      relations: ['filmActors', 'filmActors.actor'],
    });

    if (!film) {
      throw new NotFoundException(`Film bulunamadı (ID: ${id})`);
    }

    return film;
  }

  // Aktör detay getir
  async findOneActor(id: number): Promise<Actor> {
    const actor = await this.actorRepository.findOne({
      where: { id },
      relations: ['filmActors', 'filmActors.film'],
    });

    if (!actor) {
      throw new NotFoundException(`Aktör bulunamadı (ID: ${id})`);
    }

    return actor;
  }

  // Aktör ekle
  async createActor(createActorDto: any, user: any): Promise<Actor> {
    const actor = this.actorRepository.create(createActorDto);
    const saved = await this.actorRepository.save(actor);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  // Aktör güncelle
  async updateActor(id: number, updateActorDto: any, user: any): Promise<Actor> {
    const actor = await this.findOneActor(id);
    Object.assign(actor, updateActorDto);
    return this.actorRepository.save(actor);
  }

  // Aktör sil
  async deleteActor(id: number, user: any): Promise<{ message: string }> {
    const actor = await this.findOneActor(id);
    await this.actorRepository.remove(actor);
    return { message: `Aktör ${actor.name} başarıyla silindi` };
  }

  // Film ekle
  async createFilm(createFilmDto: any, user: any): Promise<Film> {
    const film = this.filmRepository.create(createFilmDto);
    const saved = await this.filmRepository.save(film);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  // Film güncelle
  async updateFilm(id: number, updateFilmDto: any, user: any): Promise<Film> {
    const film = await this.findOneFilm(id);
    Object.assign(film, updateFilmDto);
    return this.filmRepository.save(film);
  }

  // Film sil
  async deleteFilm(id: number, user: any): Promise<{ message: string }> {
    const film = await this.findOneFilm(id);
    await this.filmRepository.remove(film);
    return { message: `Film ${film.title} başarıyla silindi` };
  }

  // Aktörü filme ata
  async assignActorToFilm(dto: CreateFilmActorDto) {
    const { actorId, filmId } = dto;

    const actor = await this.actorRepository.findOneBy({ id: actorId });
    const film = await this.filmRepository.findOneBy({ id: filmId });

    if (!actor || !film) {
      throw new NotFoundException('Film veya aktör bulunamadı.');
    }

    const existing = await this.filmActorRepository.findOne({
      where: {
        actor: { id: actorId },
        film: { id: filmId }
      },
      relations: ['actor', 'film']
   });

    if (existing) {
      throw new ConflictException('Bu ilişki zaten mevcut.');
   }

    const filmActor = this.filmActorRepository.create({
      actor,
      film
   });

    return this.filmActorRepository.save(filmActor);
 }


  // Aktörü filmden çıkar
  async removeActorFromFilm(actorId: number, filmId: number) {
    // Önce ilişkiyi bul
    const filmActor = await this.filmActorRepository.findOne({
      where: {
        actor: { id: actorId },
        film: { id: filmId }
      }
    });

    if (!filmActor) {
      throw new NotFoundException('Bu aktör-film ilişkisi bulunamadı.');
    }

    // Sonra sil
    await this.filmActorRepository.remove(filmActor);

    return {
      actorId,
      filmId,
      message: 'Aktör filmden başarıyla çıkarıldı.',
    };
  }
  // Film istatistikleri
  async getFilmStatistics() {
    const totalFilms = await this.filmRepository.count();
    const totalActors = await this.actorRepository.count();
    const totalFilmActorRelations = await this.filmActorRepository.count();

    return {
      totalFilms,
      totalActors,
      totalFilmActorRelations,
      lastUpdated: new Date(),
      averageActorsPerFilm: totalFilms > 0 ? (totalFilmActorRelations / totalFilms).toFixed(2) : 0,
    };
  }

  // Aktör istatistikleri
  async getActorStatistics() {
    const totalActors = await this.actorRepository.count();

    const actorsWithFilmCount = await this.actorRepository
      .createQueryBuilder('actor')
      .leftJoin('actor.filmActors', 'filmActor')
      .select('actor.id', 'id')
      .addSelect('actor.name', 'name')
      .addSelect('COUNT(filmActor.actor_id)', 'filmCount')
      .groupBy('actor.id')
      .orderBy('filmCount', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      totalActors,
      topActorsByFilmCount: actorsWithFilmCount,
      lastUpdated: new Date(),
    };
  }

  // Tüm aktörleri detaylı listele
  async findAllActorsWithDetails(): Promise<Actor[]> {
    return this.actorRepository.find({
      relations: ['filmActors', 'filmActors.film'],
      order: { id: 'DESC' },
    });
  }

  // Tüm filmleri detaylı listele
  async findAllFilmsWithDetails(): Promise<Film[]> {
    return this.filmRepository.find({
      relations: ['filmActors', 'filmActors.actor'],
      order: { id: 'DESC' },
    });
  }
}
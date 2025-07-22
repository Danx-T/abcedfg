import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { FilmActor } from './film-actor.entity';

@Entity('films')
export class Film {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre: string;

  @Column({ name: 'release_year'})
  releaseYear: number;

  @Column()
  director: string;

  @Column({ name: 'imdb_rating', type: 'float'})
  imdbRating: number;

  @Column({ nullable: true })
  description: string;

  @Column()
  duration: number;

  @Column()
  language: string;

  @Column()
  country: string;

  @Column({ name: 'poster_url'})
  posterUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => FilmActor, (filmActor) => filmActor.film)
  filmActors: FilmActor[];
}

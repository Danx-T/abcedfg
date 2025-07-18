import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { FilmActor } from './film-actor.entity';

@Entity('films')
export class Film {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => FilmActor, (filmActor) => filmActor.film)
  filmActors: FilmActor[];
}

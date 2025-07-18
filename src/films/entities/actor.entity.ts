import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { FilmActor } from './film-actor.entity';

@Entity('actors')
export class Actor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => FilmActor, (filmActor) => filmActor.actor)
  filmActors: FilmActor[];
}

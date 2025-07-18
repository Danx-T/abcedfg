import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Film } from './film.entity';
import { Actor } from './actor.entity';

@Entity('film_actors')
export class FilmActor {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Film, (film) => film.filmActors)
  @JoinColumn({ name: 'film_id' })
  film: Film;

  @ManyToOne(() => Actor, (actor) => actor.filmActors)
  @JoinColumn({ name: 'actor_id' })
  actor: Actor;
}

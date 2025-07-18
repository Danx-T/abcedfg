import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

import { FilmsModule } from './films/films.module';  // Bunu ekledim

// Film-related entity importlarını buraya ekleyin
import { Actor } from './films/entities/actor.entity';
import { Film } from './films/entities/film.entity';
import { FilmActor } from './films/entities/film-actor.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Birinci DB bağlantısı (auth, users vs.)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log('Auth DB CONFIG:', {
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          database: configService.get<string>('DB_NAME'),
        });

        return {
          type: 'mysql',
          host: configService.get('DB_HOST'),
          port: +configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),

    // İkinci DB bağlantısı (films ve actors için)
    TypeOrmModule.forRootAsync({
      name: 'filmsConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log('Film DB CONFIG:', {
          host: configService.get<string>('FILM_DB_HOST'),
          port: configService.get<number>('FILM_DB_PORT'),
          database: configService.get<string>('FILM_DB_NAME'),
        });

        return {
          type: 'mysql',
          host: configService.get('FILM_DB_HOST') || configService.get('DB_HOST'),
          port: +configService.get('FILM_DB_PORT') || +configService.get('DB_PORT'),
          username: configService.get('FILM_DB_USERNAME') || configService.get('DB_USERNAME'),
          password: configService.get('FILM_DB_PASSWORD') || configService.get('DB_PASSWORD'),
          database: configService.get('FILM_DB_NAME') || 'film_db',
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),

    // Modüller
    AuthModule,
    UsersModule,
    FilmsModule,  // Burada aktif ettim

    // İkinci veritabanı ile bağlantılı entity'lerin module'larına eklenmesi gerekiyor
    TypeOrmModule.forFeature([Actor, Film, FilmActor], 'filmsConnection'),
  ],
})
export class AppModule {}

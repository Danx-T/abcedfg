import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';      // ✅ EKLENDİ
import { UsersModule } from './users/users.module';    // ✅ EKLENDİ

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log('DB CONFIG:', {
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
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
    AuthModule,     // ✅ Buraya eklendi
    UsersModule     // ✅ Buraya eklendi
  ],
})
export class AppModule {}

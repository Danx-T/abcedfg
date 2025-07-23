import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FilmsService } from './films.service';
import { Role } from '../auth/enums/role.enum';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';
import { CreateFilmActorDto } from './dto/create-film-actor.dto'; // ✅ EKLENDİ

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  // ===== HERKES ERİŞEBİLİR (GUARD YOK) =====

  @Get()
  getAllFilms() {
    return this.filmsService.findAllFilms();
  }

  @Get('by-actor')
  getFilmsByActor(@Query('actorId') actorId: number) {
    return this.filmsService.findFilmsByActor(actorId);
  }

  @Get('/actors')
  getAllActors() {
    return this.filmsService.findAllActors();
  }

  @Get('actors/:id')
  async getActorById(@Param('id') id: number) {
    return await this.filmsService.findOneActor(id);
  }

  @Get(':id')
  async getFilmById(@Param('id') id: number) {
    return await this.filmsService.findOneFilm(id);
  }

  // ===== SADECE ADMİN ERİŞEBİLİR =====

  @Post('actors')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createActor(@Body() createActorDto: CreateActorDto, @CurrentUser() user: any) {
    const actor = await this.filmsService.createActor(createActorDto, user);
    return {
      message: 'Aktör başarıyla eklendi!',
      actor,
      admin: user?.email,
      role: user?.role,
    };
  }

  @Patch('actors/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateActor(
    @Param('id') id: number,
    @Body() updateActorDto: UpdateActorDto,
    @CurrentUser() user: any,
  ) {
    const actor = await this.filmsService.updateActor(id, updateActorDto, user);
    return {
      message: 'Aktör başarıyla güncellendi!',
      actor,
      admin: user?.email,
      role: user?.role,
    };
  }

  @Delete('actors/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteActor(@Param('id') id: number, @CurrentUser() user: any) {
    const result = await this.filmsService.deleteActor(id, user);
    return {
      ...result,
      admin: user?.email,
      role: user?.role,
    };
  }

  @Post('admin/create')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createFilmAdmin(@Body() createFilmDto: CreateFilmDto, @CurrentUser() user: any) {
    const film = await this.filmsService.createFilm(createFilmDto, user);
    return {
      message: 'Film başarıyla eklendi!',
      film,
      admin: user?.email,
      role: user?.role,
    };
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateFilmAdmin(
    @Param('id') id: number,
    @Body() updateFilmDto: UpdateFilmDto,
    @CurrentUser() user: any,
  ) {
    const film = await this.filmsService.updateFilm(id, updateFilmDto, user);
    return {
      message: 'Film başarıyla güncellendi!',
      film,
      admin: user?.email,
      role: user?.role,
    };
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteFilmAdmin(@Param('id') id: number, @CurrentUser() user: any) {
    const result = await this.filmsService.deleteFilm(id, user);
    return {
      ...result,
      admin: user?.email,
      role: user?.role,
    };
  }

  @Get('admin/statistics')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getStatistics(@CurrentUser() user: any) {
    const stats = await this.filmsService.getFilmStatistics();
    return {
      message: 'Admin Panel İstatistikleri',
      admin: user?.email,
      role: user?.role,
      ...stats,
    };
  }

  @Get('admin/actors/statistics')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getActorStatistics(@CurrentUser() user: any) {
    const stats = await this.filmsService.getActorStatistics();
    return {
      message: 'Aktör İstatistikleri',
      admin: user?.email,
      role: user?.role,
      ...stats,
    };
  }

  @Get('admin/actors')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllActorsAdmin(@CurrentUser() user: any) {
    const actors = await this.filmsService.findAllActorsWithDetails();
    return {
      message: 'Tüm Aktörler (Admin Görünümü)',
      admin: user?.email,
      role: user?.role,
      actors,
    };
  }

  // ====== 🎯 AKTÖR - FİLM İLİŞKİLENDİRME ENDPOINTLERİ ======

  @Post('assign-actor')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async assignActorToFilm(@Body() dto: CreateFilmActorDto, @CurrentUser() user: any) {
    const result = await this.filmsService.assignActorToFilm(dto);
    return {
      message: 'Aktör filme başarıyla atandı.',
      admin: user?.email,
      result,
    };
  }

  @Delete('remove-actor')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async removeActorFromFilm(
    @Query('actorId') actorId: number,
    @Query('filmId') filmId: number,
    @CurrentUser() user: any,
  ) {
    const result = await this.filmsService.removeActorFromFilm(actorId, filmId);
    return {
      message: 'Aktör filmden çıkarıldı.',
      admin: user?.email,
      result,
    };
  }

  // ===== TEST =====

  @Post('test-no-guard')
  testNoGuard(@Body() body: any) {
    return {
      message: "Guard'sız endpoint - herkes erişebilir",
      data: body,
    };
  }

  @Post('test-role')
  testRole() {
    return {
      message: 'Role enum test',
      adminRole: Role.ADMIN,
      userRole: Role.USER,
    };
  }
}
import { 
  Controller, 
  Get, 
  Post,
  Patch,
  Delete,
  Param, 
  Query, 
  Body,
  UseGuards 
} from '@nestjs/common';
import { FilmsService } from './films.service';
import { Role } from '../auth/enums/role.enum';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';

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

  @Get(':id')
  getFilmById(@Param('id') id: number) {
    return this.filmsService.findAllFilms();
  }

  // ===== SADECE ADMİN ERİŞEBİLİR =====

  // Film ekle (sadece admin)
  @Post('admin/create')
  @UseGuards(JwtAuthGuard, AdminGuard)
  createFilmAdmin(@Body() createFilmDto: CreateFilmDto, @CurrentUser() user: any) {
    return { 
      message: 'Film başarıyla eklendi!',
      data: createFilmDto,
      admin: user?.email,
      role: user?.role
    };
  }

  // Film güncelle (sadece admin)
  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateFilmAdmin(
    @Param('id') id: number,
    @Body() updateFilmDto: UpdateFilmDto,
    @CurrentUser() user: any
  ) {
    return { 
      message: `Film ${id} başarıyla güncellendi!`,
      data: updateFilmDto,
      admin: user?.email,
      role: user?.role
    };
  }

  // Film sil (sadece admin)
  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  deleteFilmAdmin(@Param('id') id: number, @CurrentUser() user: any) {
    return { 
      message: `Film ${id} başarıyla silindi!`,
      admin: user?.email,
      role: user?.role
    };
  }

  // Admin istatistikleri
  @Get('admin/statistics')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getStatistics(@CurrentUser() user: any) {
    return {
      message: 'Admin Panel İstatistikleri',
      admin: user?.email,
      role: user?.role,
      stats: {
        totalFilms: 150,
        totalActors: 75,
        totalUsers: 25,
        date: new Date().toISOString()
      }
    };
  }

  // ===== TEST ENDPOINT'LERİ =====

  @Post('test-no-guard')
  testNoGuard(@Body() body: any) {
    return { 
      message: 'Guard\'sız endpoint - herkes erişebilir',
      data: body
    };
  }

  @Post('test-role')
  testRole() {
    return {
      message: 'Role enum test',
      adminRole: Role.ADMIN,
      userRole: Role.USER
    };
  }
}
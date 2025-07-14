// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'; // ← COMMENT YAPILDI
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthResponseDto } from './dto/auth-response.dto';

// @ApiTags('Authentication') // ← COMMENT YAPILDI
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  // @ApiOperation({ summary: 'Kullanıcı kaydı' }) // ← COMMENT YAPILDI
  // @ApiResponse({ status: 201, description: 'Başarılı kayıt', type: AuthResponseDto }) // ← COMMENT YAPILDI
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    console.log('🔥 REGISTER ENDPOINT HIT!', registerDto);
    try {
      const result = await this.authService.register(registerDto);
      console.log('✅ REGISTER SUCCESS!', result);
      return result;
    } catch (error) {
      console.log('❌ REGISTER ERROR:', error.message);
      throw error;
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Kullanıcı girişi' }) // ← COMMENT YAPILDI
  // @ApiResponse({ status: 200, description: 'Başarılı giriş', type: AuthResponseDto }) // ← COMMENT YAPILDI
  async login(@Request() req, @Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(req.user);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Şifre sıfırlama talebi' }) // ← COMMENT YAPILDI
  // @ApiResponse({ status: 200, description: 'E-posta başarıyla gönderildi' }) // ← COMMENT YAPILDI
  // @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' }) // ← COMMENT YAPILDI
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    console.log('📧 FORGOT PASSWORD ENDPOINT HIT!', forgotPasswordDto.email);
    try {
      const result = await this.authService.forgotPassword(forgotPasswordDto);
      console.log('✅ FORGOT PASSWORD SUCCESS!');
      return result;
    } catch (error) {
      console.log('❌ FORGOT PASSWORD ERROR:', error.message);
      throw error;
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Şifre sıfırlama' }) // ← COMMENT YAPILDI
  // @ApiResponse({ status: 200, description: 'Şifre başarıyla güncellendi' }) // ← COMMENT YAPILDI
  // @ApiResponse({ status: 400, description: 'Geçersiz veya süresi dolmuş token' }) // ← COMMENT YAPILDI
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    console.log('🔑 RESET PASSWORD ENDPOINT HIT!');
    try {
      const result = await this.authService.resetPassword(resetPasswordDto);
      console.log('✅ RESET PASSWORD SUCCESS!');
      return result;
    } catch (error) {
      console.log('❌ RESET PASSWORD ERROR:', error.message);
      throw error;
    }
  }
}
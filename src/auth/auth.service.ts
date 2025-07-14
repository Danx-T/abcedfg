// src/auth/auth.service.ts
import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { User } from '../users/entities/user.entity';
import { EmailService } from '../common/services/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  // EKSİK METHODLAR - Bunları ekleyin ⬇️
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, username, password, firstName, lastName } = registerDto;

    // Kullanıcı zaten var mı kontrol et
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new BadRequestException('Bu e-posta veya kullanıcı adı zaten kullanılıyor');
    }

    // Şifreyi hashle
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Yeni kullanıcı oluştur
    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
    });

    await this.userRepository.save(user);

    // JWT token oluştur
    const payload = { email: user.email, sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async login(user: User): Promise<AuthResponseDto> {
    const payload = { email: user.email, sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }

    return null;
  }

  // MEVCUT METHODLARINIZ ⬇️ (değişmedi)
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    
    console.log('🔍 Kullanıcı aranıyor:', email);
    
    const user = await this.userRepository.findOne({
      where: { email }
    });

    if (!user) {
      console.log('❌ Kullanıcı bulunamadı:', email);
      throw new NotFoundException('Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı');
    }

    console.log('✅ Kullanıcı bulundu:', user.username);

    // Reset token oluştur
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 saat geçerli

    console.log('🔑 Reset token oluşturuldu:', resetToken.substring(0, 10) + '...');

    // Token'ı hashleme (güvenlik için)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Kullanıcıyı güncelle
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await this.userRepository.save(user);

    console.log('💾 Token veritabanına kaydedildi');

    try {
      // E-posta gönder
      await this.emailService.sendPasswordReset(email, resetToken, user.username);
      console.log('📧 E-posta gönderildi:', email);
      
      return {
        message: 'Şifre sıfırlama linki e-posta adresinize gönderildi',
      };
    } catch (emailError) {
      console.log('❌ E-posta gönderilemedi:', emailError.message);
      throw new BadRequestException('E-posta gönderilirken hata oluştu');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    console.log('🔍 Reset token kontrol ediliyor...');

    // Token'ı hashle
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Geçerli token'ı bul
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: hashedToken,
      }
    });

    if (!user) {
      console.log('❌ Geçersiz token');
      throw new BadRequestException('Geçersiz token');
    }

    // ✅ DÜZELTİLDİ: undefined kontrolü eklendi
    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      console.log('❌ Token süresi dolmuş');
      throw new BadRequestException('Token süresi dolmuş');
    }

    console.log('✅ Token geçerli, şifre güncelleniyor:', user.username);

    // Yeni şifreyi hashle
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // ✅ DÜZELTİLDİ: null yerine undefined kullanıldı
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await this.userRepository.save(user);

    console.log('💾 Şifre güncellendi');

    try {
      // Onay e-postası gönder
      await this.emailService.sendPasswordResetConfirmation(user.email, user.username);
      console.log('📧 Onay e-postası gönderildi');
    } catch (emailError) {
      console.log('⚠️ Onay e-postası gönderilemedi:', emailError.message);
      // Şifre değişti ama mail gitmedi, yine de başarılı sayalım
    }

    return {
      message: 'Şifreniz başarıyla güncellendi',
    };
  }
}
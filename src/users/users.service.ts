import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    // Email zaten var mı kontrol et
    const existingUser = await this.usersRepository.findOne({
      where: {
        email: registerDto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email veya kullanıcı adı zaten mevcut');
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  // ŞİFRE SIFIRLAMA METODLARİ ⬇️
  async createPasswordResetToken(email: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Bu email adresi ile kayıtlı kullanıcı bulunamadı');
    }

    // 32 byte random token oluştur
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Token'ı hash'le ve database'e kaydet
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Token 1 saat geçerli
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.usersRepository.update(user.id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expiresAt,
    });

    console.log(`🔑 Reset token oluşturuldu: ${email}`);
    
    // Plain token'ı döndür (email'de gönderilecek)
    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Token'ı hash'le
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Token'ı ve süresini kontrol et
    const user = await this.usersRepository.findOne({
      where: {
        resetPasswordToken: hashedToken,
      },
    });

    if (!user) {
      throw new BadRequestException('Geçersiz veya süresi dolmuş token');
    }

    // Token süresi dolmuş mu?
    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Token süresi dolmuş. Yeni bir sıfırlama talebi yapın.');
    }

    // Yeni şifreyi hash'le
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Şifreyi güncelle ve token'ları temizle
    await this.usersRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });

    console.log(`✅ Şifre başarıyla sıfırlandı: ${user.email}`);
  }
}
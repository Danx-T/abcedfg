// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendPasswordReset(email: string, token: string, username: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Etiya - Şifre Sıfırlama Talebi',
      template: './reset-password',
      context: {
        username,
        resetUrl,
        email,
      },
    });
  }

  async sendPasswordResetConfirmation(email: string, username: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Etiya - Şifreniz Başarıyla Değiştirildi',
      template: './password-changed',
      context: {
        username,
        email,
      },
    });
  }
}
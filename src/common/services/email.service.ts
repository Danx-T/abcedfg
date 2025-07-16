// src/common/services/email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
      tls: {
        rejectUnauthorized: false, 
      },
    });
  }

  // Şifre sıfırlama maili gönder - resetUrl frontend URL olarak ayarlandı
  async sendPasswordReset(email: string, token: string, username: string): Promise<void> {
    // BURADA FRONTEND SAYFANIN URL'Sİ OLMALI
    const resetUrl = `http://localhost:5500/frontend/password/reset-password.html?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('MAIL_FROM'),
      to: email,
      subject: '🔐 Etiya - Şifre Sıfırlama Talebi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Merhaba ${username}! 👋</h2>
          
          <p style="color: #555; font-size: 16px;">
            <strong>${email}</strong> e-posta adresiniz için şifre sıfırlama talebinde bulundunuz.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block; 
                      font-weight: bold; font-size: 16px;">
              🔑 Şifreyi Sıfırla
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            ⏰ Bu link <strong>1 saat</strong> geçerlidir.
          </p>
          
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
            Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.<br>
            Link çalışmıyorsa: <span style="background-color: #f1f1f1; padding: 2px 5px; font-family: monospace;">${resetUrl}</span>
          </p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
    console.log(`✅ Şifre sıfırlama e-postası gönderildi: ${email}`);
  }

  // Şifre başarıyla değişti onayı maili
  async sendPasswordResetConfirmation(email: string, username: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('MAIL_FROM'),
      to: email,
      subject: '✅ Etiya - Şifreniz Başarıyla Değiştirildi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
          <h2 style="color: #28a745; text-align: center;">Şifreniz Güncellendi! ✅</h2>
          
          <p style="color: #555; font-size: 16px;">
            Merhaba <strong>${username}</strong>,
          </p>
          
          <p style="color: #555; font-size: 16px;">
            <strong>${email}</strong> hesabınızın şifresi başarıyla değiştirildi.
          </p>
          
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>🔒 Güvenlik Bildirimi:</strong><br>
            Eğer bu değişikliği siz yapmadıysanız, lütfen derhal bizimle iletişime geçin.
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
            Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.
          </p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
    console.log(`✅ Şifre değişiklik onayı gönderildi: ${email}`);
  }

  // Geriye dönük uyumluluk
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    await this.sendPasswordReset(email, token, 'Kullanıcı');
  }
}

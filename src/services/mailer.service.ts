import { ConstantsService } from './constants.service';
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailerService.name);

  constructor(private constantsService: ConstantsService) {
    this.transporter = nodemailer.createTransport({
      host: this.constantsService.mailerHost,
      service: this.constantsService.mailService,
      port: this.constantsService.mailerPort,
      secure: true,
      auth: {
        user: this.constantsService.nodemailerEmail,
        pass: this.constantsService.nodemailerPassword,
      },
    });
  }

  async sendMail(to: string, appName: string): Promise<void> {
    const from = `${this.constantsService.appName} <${this.constantsService.nodemailerEmail}>`;

    const now = new Date();
    now.setHours(now.getHours() + 1);

    const formattedDate = now.toLocaleString();

    const subject = `⚠️ Alert:: ${appName} is DOWN!!!`;

    const text =
      `Dear team,\n\n` +
      `This is to notify you that the application "${appName}" is currently down and not responding as of ${formattedDate}. ` +
      `Please take immediate action to investigate and restore the system.\n\n` +
      `Regards,\n` +
      `Team WARPSPEED`;

    const html = `
    <p>Dear team,</p>
    <p>This is to notify you that the application <strong>${appName}</strong> is currently down and not responding as of <strong>${formattedDate}</strong>.</p>
    <p>Please take immediate action to investigate and restore the system.</p>
    <p>Regards,<br/>Team WARPSPEED</p>
  `;

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
      this.logger.log(`Message sent to ${info.accepted[0]}`);
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`);
    }
  }
}

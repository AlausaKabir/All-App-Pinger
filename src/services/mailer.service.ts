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

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject: `Alert : ${appName} is DOWN!!!`,
        text: `The application ${appName} is down and not responding. Please check the application.`,
      });
      this.logger.log(`Message sent: ${info.accepted[0]}`);
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`);
    }
  }
}

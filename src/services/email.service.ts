import { Injectable } from '@nestjs/common';
import { EmailRepository } from 'src/repositories/email.respository';

@Injectable()
export class EmailService {
  constructor(private readonly emailRepo: EmailRepository) {}

  async registerEmail(data: { email: string }) {
    return this.emailRepo.registerEmail(data);
  }

  async getNotificationEmail() {
    return this.emailRepo.getNotificationEmail();
  }
}

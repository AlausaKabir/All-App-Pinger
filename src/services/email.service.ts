import { Injectable } from '@nestjs/common';
import { EmailRepository } from 'src/repositories/email.respository';

@Injectable()
export class EmailService {
  constructor(private readonly emailRepo: EmailRepository) {}

  async registerEmail(data: { email: string }) {
    try {
      return this.emailRepo.registerEmail(data);
    } catch (error) {
      if (error.message.includes('Email already exists')) {
        throw new Error('Email already exists');
      }
    }
  }

  async getNotificationEmail() {
    try {
      return this.emailRepo.getNotificationEmail();
    } catch (error) {
      if (error.message.includes('No email found')) {
        throw new Error('No email found');
      }
    }
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EmailRepository } from 'src/repositories/email.respository';

@Injectable()
export class EmailService {
  constructor(private readonly emailRepo: EmailRepository) {}

  async registerEmail(data: { email: string }) {
    try {
      return this.emailRepo.registerEmail(data);
    } catch (error) {
      if (error.message.includes('Email already exists')) {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getNotificationEmail() {
    try {
      return this.emailRepo.getNotificationEmail();
    } catch (error) {
      if (error.message.includes('No email found')) {
        throw new HttpException('No email found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

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

  async getAllNotificationEmails() {
    try {
      return this.emailRepo.getAllNotificationEmails();
    } catch (error) {
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async toggleEmailStatus(emailId: string) {
    try {
      return this.emailRepo.toggleEmailStatus(emailId);
    } catch (error) {
      if (error.message.includes('Email not found')) {
        throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteNotificationEmail(emailId: string) {
    try {
      return this.emailRepo.deleteNotificationEmail(emailId);
    } catch (error) {
      if (error.message.includes('Email not found')) {
        throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

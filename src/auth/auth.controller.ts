import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignupDto, LoginDto } from 'src/dto/auth.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Email already exists' })
  @ApiResponse({ status: 500, description: 'Something went wrong' })
  async signup(@Body() signupDto: SignupDto) {
    try {
      return this.authService.signup(signupDto);
    } catch (error) {
      this.logger.error(`Error registering user: ${error.message}`);
      if (error.message === 'Email already exists') {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          'Something went wrong',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  async login(@Body() loginDto: LoginDto) {
    try {
      const loginResult = await this.authService.login(loginDto);
      return loginResult;
    } catch (error) {
      this.logger.error(`Error logging in user: ${error.message}`);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

import { Body, Controller, Get, Headers, Inject, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService
  ) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string; name: string }) {
    return this.authService.register(body.email, body.password, body.name);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Get('me')
  async me(@Headers('authorization') authHeader?: string) {
    const token = authHeader?.replace(/^Bearer\s+/i, '') || '';
    return this.authService.getProfile(token);
  }
}

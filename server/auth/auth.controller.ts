import { Body, Controller, Get, Headers, Inject, Post, Req } from '@nestjs/common';
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

  @Post('verify-email')
  async verifyEmail(@Body() body: { email: string; code: string }) {
    return this.authService.verifyEmail(body.email, body.code);
  }

  @Post('resend-code')
  async resendCode(@Body() body: { email: string }) {
    return this.authService.resendVerificationCode(body.email);
  }

  @Post('google')
  async googleLogin(@Body() body: { credential?: string; email?: string; name?: string; sub?: string }) {
    return this.authService.loginWithGoogle(body);
  }

  @Post('apple')
  async appleLogin(@Body() body: { credential?: string; email?: string; name?: string; sub?: string }) {
    return this.authService.loginWithApple(body);
  }

  @Post('magic-link/send')
  async sendMagicLink(@Body() body: { email: string; origin?: string }, @Headers('origin') headerOrigin?: string) {
    const origin = body.origin || headerOrigin;
    return this.authService.sendMagicLink(body.email, origin);
  }

  @Post('magic-link/verify')
  async verifyMagicToken(@Body() body: { token: string }) {
    return this.authService.verifyMagicToken(body.token);
  }

  @Post('magic-link/verify-code')
  async verifyMagicCode(@Body() body: { email: string; code: string }) {
    return this.authService.verifyMagicCode(body.email, body.code);
  }

  @Get('me')
  async me(@Headers('authorization') authHeader?: string) {
    const token = authHeader?.replace(/^Bearer\s+/i, '') || '';
    return this.authService.getProfile(token);
  }
}

import { Controller, Get, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('set-cookie')
  setCookie(@Req() req: Request, @Res() res: Response) {
    // Check if the user already has a cookie
    const existingCookie = req.cookies['vote_cookie'];

    if (existingCookie) {
      return res.json({
        message: 'Cookie already exists',
        vote_cookie: existingCookie,
      });
    }

    // Generate a new cookie
    const newCookie = this.authService.generateCookie();

    res.cookie('vote_cookie', newCookie, {
      httpOnly: true, // Prevent JavaScript access
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days expiry
      secure: true, // Set to true in production if using HTTPS
      sameSite: false,
    });

    return res.json({ message: 'New cookie set', vote_cookie: newCookie });
  }
}

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateGuestDto } from './auth.dto';
import { GuestAuthGuard } from './guest-auth.guard';
import { CurrentGuest } from './current-guest.decorator';
import type { GuestPayload } from './current-guest.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('guest')
  createGuest(@Body() dto: CreateGuestDto) {
    return this.authService.createGuestSession(dto);
  }

  @Get('me')
  @UseGuards(GuestAuthGuard)
  me(@CurrentGuest() guest: GuestPayload) {
    return this.authService.getMe(guest.id);
  }
}

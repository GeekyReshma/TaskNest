import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GuestAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] as string | undefined;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid guest session token');
    }

    const token = authHeader.slice(7);

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; name: string }>(token);
      const guest = await this.prisma.guestUser.findUnique({ where: { id: payload.sub } });

      if (!guest) {
        throw new UnauthorizedException('Guest session is no longer valid');
      }

      request.guest = { id: guest.id, name: guest.name };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired guest session');
    }
  }
}

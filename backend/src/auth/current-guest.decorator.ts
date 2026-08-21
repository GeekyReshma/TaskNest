import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface GuestPayload {
  id: string;
  name: string;
}

export const CurrentGuest = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): GuestPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.guest;
  },
);

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { SafeUser } from '../../users/entities/user.entity.js';

export const CurrentUser = createParamDecorator(
  (data: keyof SafeUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as SafeUser | undefined;
    if (!user) {
      return undefined;
    }
    return data ? user[data] : user;
  },
);

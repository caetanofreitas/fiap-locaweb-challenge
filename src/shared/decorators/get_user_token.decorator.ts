import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetCurrentUserToken = createParamDecorator(
  (_, context: ExecutionContext) =>
    context.switchToHttp().getRequest().user.replace(/ /g, ''),
);

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest<UserContextDto>(err, user: UserContextDto) {
    if (err || !user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid username or password',
      });
    }
    return user;
  }
}

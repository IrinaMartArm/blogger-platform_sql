import { Module } from '@nestjs/common';

import { JwtStrategy } from './auth/guards/bearer/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { LocalStrategy } from './auth/guards/local/local.strategy';
import { AuthController } from './auth/api/auth.controller';
import { ConfirmRegistrationUseCase } from './auth/application/commands/confirmRegistration.use-case';
import { RegistrationUseCase } from './auth/application/commands/registration.use-case';

import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/token.constants';
import { NewPasswordUseCase } from './auth/application/commands/new-password.use-case';
import { EmailResendingUseCase } from './auth/application/commands/emailResending.use-case';
import { PasswordRecoveryUseCase } from './auth/application/commands/passwordRecovery.use-case';
import { LoginUseCase } from './auth/application/commands/login.use-case';
import { UserAccountsConfig } from './user-accounts.config';
import { SecurityDevicesController } from './security_devices/api/security-devices.controller';
import { DeleteUserUseCase } from './user/application/useCases/delete-user.use-case';
import { DeleteDevicesUseCase } from './security_devices/application/use-cases/delete-device.use-case';
import { DeleteDeviceUseCase } from './security_devices/application/use-cases/delete-devices.use-case';
import { GetDevicesQueryHandler } from './security_devices/infrastructure/query/get-devices.query';
import { UsersController } from './user/api/user.controller';
import { BcryptService } from './auth/application/bcrypt.service';
import { UsersRepository } from './user/infrastructure/users.repository';
import { UsersQueryRepository } from './user/infrastructure/users.query-repository';
import { ExternalUsersQueryRepository } from './user/infrastructure/external-query/external-users-query.repository';
import { DevicesQueryRepository } from './security_devices/infrastructure/devices.query-repository';
import { AuthService } from './auth/application/auth.service';
import { DevicesRepository } from './security_devices/infrastructure/devices.repository';
import { RefreshTokenUseCase } from './auth/application/commands/refresh-token.use-case';
import { GetUsersHandler } from './user/infrastructure/query/get-users.query';
import { GetMeHandler } from './auth/infrastructure/query/get-me.query';
import { CreateUserUseCase } from './user/application/useCases/create-user.use-case';
import { GetUserQueryUseCase } from './user/infrastructure/query/get-user.query';
import { JwtRefreshStrategy } from './auth/guards/bearer/refresh.strategy';
import { LogoutUseCase } from './auth/application/commands/logout.use-case';
import { EmailConfirmationsRepository } from './email_confirmations/infrastructure/email_confirmations.repository';
import { EmailService } from './auth/application/email.service';
import { CreateEmailConfirmationHandler } from './auth/application/events/handlers/create-email-confirmation.handler';
import { SendEmailConfirmationHandler } from './auth/application/events/handlers/send-confirmation-email.handler';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './user/application/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entity/user.entity';
import { Device } from './security_devices/entity/device.entity';
import { EmailConfirmations } from './email_confirmations/domain/email_confirmations.entity';

const CommandHandlers = [
  LogoutUseCase,
  ConfirmRegistrationUseCase,
  EmailResendingUseCase,
  LoginUseCase,
  NewPasswordUseCase,
  PasswordRecoveryUseCase,
  RefreshTokenUseCase,
  RegistrationUseCase,
  DeleteDevicesUseCase,
  DeleteDeviceUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
];
const EventHandlers = [
  SendEmailConfirmationHandler,
  CreateEmailConfirmationHandler,
];
const QueryHandlers = [
  GetDevicesQueryHandler,
  GetUserQueryUseCase,
  GetUsersHandler,
  GetMeHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      //в feature-модулях - регистрирует репозитории для Dependency Injection
      User,
      Device,
      EmailConfirmations,
    ]),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: configService.get<string>('EMAIL'),
            pass: configService.get<string>('PASSWORD'),
          },
        },
        defaults: {
          from: `"App" <${configService.get<string>('EMAIL')}>`,
        },
      }),
    }),
    PassportModule,
    JwtModule,
  ],
  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [
    UserAccountsConfig,
    BcryptService,
    AuthService,
    EmailConfirmationsRepository,
    EmailService,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    DevicesRepository,
    DevicesQueryRepository,
    ExternalUsersQueryRepository,
    JwtStrategy,
    LocalStrategy,
    JwtRefreshStrategy,
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (config: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: config.accessTokenSecret,
          signOptions: {
            expiresIn: config.accessTokenExpireIn,
          },
        });
      },
      inject: [UserAccountsConfig],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (config: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: config.refreshTokenSecret,
          signOptions: { expiresIn: config.refreshTokenExpireIn },
        });
      },
      inject: [UserAccountsConfig],
    },
  ],
  exports: [ExternalUsersQueryRepository],
})
export class UserAccountsModule {}

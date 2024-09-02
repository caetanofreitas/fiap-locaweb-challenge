import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { entities } from './models';
import { AuthGuard } from 'shared/guards';
import { AuthStrategy } from 'shared/strategies';
import { AuthModule } from 'auth/auth.module';
import { DataSourceOptions } from 'typeorm';
import { UserModule } from 'user/user.module';
import { EventsModule } from 'events/events.module';
import { EmailModule } from 'email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...getDbConfig(configService),
        autoLoadEntities: true,
        useUTC: true,
      }),
      inject: [ConfigService],
    }),
    JwtModule.register({}),
    AuthModule,
    EventsModule,
    UserModule,
    EmailModule,
  ],
  controllers: [],
  providers: [
    AuthStrategy,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}

function getDbConfig(configService: ConfigService): DataSourceOptions {
  let option: DataSourceOptions = null;

  switch (configService.get('DB_DRIVER')) {
    case 'oracle':
      option = {
        type: 'oracle',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        synchronize: true,
        entities,
      };
    case 'mysql':
      option = {
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        synchronize: true,
        entities,
      };
    case 'postgres':
      option = {
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        synchronize: true,
        entities,
        uuidExtension: 'uuid-ossp',
      };
    default:
      option = {
        type: 'sqlite',
        database: 'sql.db',
        synchronize: true,
        entities,
      };
  }

  return option;
}

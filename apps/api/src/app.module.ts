import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './common/prisma/prisma.module.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { MediaModule } from './modules/media/media.module.js';
import { MomentsModule } from './modules/moments/moments.module.js';
import { fileURLToPath } from 'url';
import * as path from 'path';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { FriendsModule } from './modules/friends/friends.module.js';
import { InteractionsModule } from './modules/interactions/interactions.module.js';
import { EmotionsModule } from './modules/emotions/emotions.module.js';
import { ChatModule } from './modules/chat/chat.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { MailModule } from './modules/mail/mail.module.js';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, 'i18n'),
        watch: false,
      },
      resolvers: [
        new HeaderResolver(['x-custom-lang']),
        new AcceptLanguageResolver(),
        new QueryResolver(['lang', 'locale']),
      ],
    }),
    PrismaModule,
    MailModule,
    AuthModule,
    UsersModule,
    MediaModule,
    MomentsModule,
    FriendsModule,
    InteractionsModule,
    EmotionsModule,
    ChatModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContestsModule } from './contests/contests.module';
import { PrismaModule } from './prisma/prisma.module';
import { ParticipantModule } from './participant/participant.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { VoteModule } from './vote/vote.module';
import { ContestCronService } from './contest-cron/contest-cron.service';

@Module({
  imports: [
    ContestsModule,
    PrismaModule,
    ParticipantModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
      ttl: 86400, // 1 day cache expiration in seconds
    }),
    AuthModule,
    VoteModule,
  ],
  controllers: [AppController],
  providers: [AppService, ContestCronService],
})
export class AppModule {}

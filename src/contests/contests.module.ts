import { Module } from '@nestjs/common';
import { ContestsService } from './contests.service';
import { ContestsController } from './contests.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [ContestsService, PrismaService],
  controllers: [ContestsController]
})
export class ContestsModule {}

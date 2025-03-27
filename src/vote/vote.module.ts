import { Module } from '@nestjs/common';
import { VoteController } from './vote.controller';
import { VoteService } from './vote.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [VoteController],
  providers: [VoteService, PrismaService]
})
export class VoteModule {}

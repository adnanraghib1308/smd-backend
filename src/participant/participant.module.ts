import { Module } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { ParticipantController } from './participant.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [ParticipantService, PrismaService],
  controllers: [ParticipantController]
})
export class ParticipantModule {}

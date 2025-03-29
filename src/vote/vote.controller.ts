import {
  Controller,
  Post,
  Req,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { VoteService } from './vote.service';

@Controller('vote')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post()
  async vote(
    @Req() req: Request,
    @Body('participantId') participantId: number,
    @Body('fingerprintId') fingerprintId: string,
  ) {
    const cookieId = req.cookies['vote_cookie']; // Get stored cookie

    if (!cookieId || !fingerprintId) {
      throw new BadRequestException(
        'No vote cookie found. Please enable cookies.',
      );
    }

    return this.voteService.voteForParticipant(
      participantId,
      cookieId,
      fingerprintId,
    );
  }
}

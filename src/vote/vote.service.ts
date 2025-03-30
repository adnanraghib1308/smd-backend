import { Inject, BadRequestException, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class VoteService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache, // Inject cache manager
  ) {}

  async voteForParticipant(
    participantId: number,
    cookieId: string,
    fingerprintId: string,
  ) {
    // Check if user has already voted for this participant
    let existingVote = await this.prisma.vote.findFirst({
      where: { participantId, cookieId },
    });
    if (!existingVote) {
      existingVote = await this.prisma.vote.findFirst({
        where: { participantId, fingerprintId },
      });
    }

    if (existingVote) {
      throw new BadRequestException(
        'You have already voted for this participant.',
      );
    }

    // Fetch the participant along with contest status
    const participant = await this.prisma.participant.findUnique({
      where: { id: participantId },
      select: { contestId: true, contest: { select: { status: true } } },
    });

    if (!participant) {
      throw new BadRequestException('Participant not found.');
    }

    // Ensure the contest is active before allowing voting
    if (participant.contest.status !== 'active') {
      throw new BadRequestException(
        'Voting is disabled now. Contest has not started yet.',
      );
    }

    const contestId = participant.contestId.toString(); // Convert to string for cache key

    // Delete cached participants of this contest
    await this.cacheManager.del(`participants_${contestId}_${cookieId}`);
    await this.cacheManager.del(`leaderboard_${contestId}`);

    // Store new vote
    return this.prisma.vote.create({
      data: { participantId, cookieId, fingerprintId },
    });
  }
}

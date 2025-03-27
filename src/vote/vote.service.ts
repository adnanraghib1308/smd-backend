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

  async voteForParticipant(participantId: number, cookieId: string) {
    // Check if user has already voted for this participant
    const existingVote = await this.prisma.vote.findFirst({
      where: { participantId, cookieId },
    });

    if (existingVote) {
      throw new BadRequestException('You have already voted for this participant.');
    }

    // Fetch the participant to get contestId
    const participant = await this.prisma.participant.findUnique({
      where: { id: participantId },
      select: { contestId: true },
    });

    if (!participant) {
      throw new BadRequestException('Participant not found.');
    }

    const contestId = participant.contestId.toString(); // Convert to string for cache key

    // Delete cached participants of this contest
    await this.cacheManager.del(`participants_${contestId}_${cookieId}`);
    await this.cacheManager.del(`leaderboard_${contestId}`);

    // Store new vote
    return this.prisma.vote.create({
      data: { participantId, cookieId },
    });
  }
}

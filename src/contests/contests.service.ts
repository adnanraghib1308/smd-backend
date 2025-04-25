import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ContestListResponse } from './dto/contest-list.dto';
import { formatDistanceToNow } from 'date-fns';
import { Cache } from 'cache-manager';

@Injectable()
export class ContestsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createContest(data: Prisma.ContestCreateInput) {
    await this.cacheManager.del('contests_list');
    return this.prisma.contest.create({ data });
  }

  async getAllContests() {
    return this.prisma.contest.findMany();
  }

  async getContestById(id: number) {
    return this.prisma.contest.findUnique({ where: { id } });
  }

  async updateContest(id: number, data: Prisma.ContestUpdateInput) {
    await this.cacheManager.del('contests_list');
    return this.prisma.contest.update({ where: { id }, data });
  }

  async deleteContest(id: number) {
    return this.prisma.contest.delete({ where: { id } });
  }

  async getUpcomingContest() {
    return this.prisma.contest.findFirst({
      where: {
        status: {
          in: ['upcoming', 'active'],
        },
      },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });
  }

  async listContests() {
    // Check cache first
    const cachedData = await this.cacheManager.get('contests_list');
    if (cachedData) {
      return cachedData;
    }

    // Fetch ongoing contests (status = active)
    const ongoingContests = await this.prisma.contest.findMany({
      where: { status: 'active' },
      include: { _count: { select: { participants: true } } },
      orderBy: { id: 'desc' },
    });

    // Fetch upcoming contests (status = upcoming)
    const upcomingContests = await this.prisma.contest.findMany({
      where: { status: 'upcoming' },
      include: { _count: { select: { participants: true } } },
      orderBy: { id: 'desc' },
    });

    // Fetch past contests (status = inactive)
    const pastContests = await this.prisma.contest.findMany({
      where: { status: 'inactive' },
      include: {
        participants: { select: { id: true, babyName: true } },
        _count: { select: { participants: true } },
      },
      orderBy: { id: 'desc' },
    });

    // Find the winner for past contests (most votes)
    const pastContestResults = await Promise.all(
      pastContests.map(async (contest) => {
        const winner = await this.prisma.vote.groupBy({
          by: ['participantId'],
          where: { participant: { contestId: contest.id } },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 1,
        });

        const winnerParticipant = contest.participants.find(
          (p) => p.id === winner[0]?.participantId,
        );
        return {
          id: contest.id,
          title: contest.name,
          participants: contest._count.participants,
          startDate: contest.startDate,
          endDate: contest.endDate,
          winner: winnerParticipant?.babyName || 'No Winner',
          image: contest.contestImage,
        };
      }),
    );

    // Format response
    const response: ContestListResponse = {
      upcoming: upcomingContests.map((contest) => ({
        id: contest.id,
        title: contest.name,
        participants: contest._count.participants,
        startDate: contest.startDate,
        endDate: contest.endDate,
        startsIn: formatDistanceToNow(contest.startDate, { addSuffix: true }),
        image: contest.contestImage,
      })),
      ongoing: ongoingContests.map((contest) => ({
        id: contest.id,
        title: contest.name,
        participants: contest._count.participants,
        startDate: contest.startDate,
        endDate: contest.endDate,
        endsIn: formatDistanceToNow(contest.endDate, { addSuffix: true }),
        image: contest.contestImage,
      })),
      past: pastContestResults,
    };

    // Store in cache for 1 day (86400 seconds)
    await this.cacheManager.set('contests_list', response);

    return response;
  }
}

import {
  BadRequestException,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { formatDistanceToNowStrict } from 'date-fns';

@Injectable()
export class ParticipantService {
  private s3: S3Client;
  private bucketName: string | undefined;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.s3 = new S3Client([
      {
        region: this.configService.get<string>('AWS_REGION'),
        credentials: {
          accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
          secretAccessKey: this.configService.get<string>(
            'AWS_SECRET_ACCESS_KEY',
          ),
        },
      },
    ]);

    this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME');
  }

  async uploadImage(file: any, contestId: string): Promise<string> {
    if (!contestId)
      throw new HttpException('No Contest Id found.', HttpStatus.BAD_REQUEST);
    const fileKey = `participants/${contestId}/${file.originalname}`;

    const uploadParams = {
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await this.s3.send(new PutObjectCommand(uploadParams));

    return `https://${this.bucketName}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${fileKey}`;
  }

  async joinContest(data: CreateParticipantDto, cookieId: string) {
    // Validate contest existence
    const contest = await this.prisma.contest.findUnique({
      where: { id: data.contestId },
      select: { status: true }, // Only fetch status field
    });

    if (!contest) {
      throw new BadRequestException('Contest not found');
    }

    // Check if the contest is upcoming
    if (contest.status !== 'upcoming') {
      throw new BadRequestException('You can only join an upcoming contest');
    }

    // Insert participant
    const participant = await this.prisma.participant.create({
      data: {
        contestId: data.contestId,
        babyName: data.babyName,
        babyDob: new Date(data.babyDob), // Ensure Date type
        babyGender: data.babyGender,
        babyImage: data.babyImage,
        parentName: data.parentName,
        parentContactNumber: data.parentContactNumber,
        city: data.city,
      },
    });

    // Clear cache
    const participantKey = `participants_${data.contestId}_${cookieId}`;
    await this.cacheManager.del(participantKey);
    await this.cacheManager.del('contests_list');
    await this.cacheManager.del(`leaderboard_${data.contestId}`);

    return { message: 'Participant registered successfully', participant };
  }

  async getParticipantsByContest(
    contestId: number,
    cookieId: string,
    fingerprintId: string,
  ) {
    const cacheKey = `participants_${contestId}_${cookieId}`;

    // Check if the data is cached
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) return cachedData;

    const contest = await this.prisma.contest.findFirst({
      where: { id: contestId },
    });
    if (contest?.status === 'inactive')
      throw new BadRequestException('This contest is over!!');

    // Fetch participants and their votes
    const participants = await this.prisma.participant.findMany({
      where: { contestId },
      include: {
        votes: true, // Fetch all votes for each participant
      },
    });

    if (!participants.length) {
      throw new NotFoundException('No participants found for this contest');
    }

    // Format response
    const formatedParticipants = participants.map((participant) => ({
      id: participant.id,
      name: participant.babyName,
      age: formatDistanceToNowStrict(new Date(participant.babyDob)), // Age in human format
      votes: participant.votes.length,
      image: participant.babyImage,
      isVote: participant.votes.some(
        (vote) =>
          vote.cookieId === cookieId || vote.fingerprintId === fingerprintId,
      ), // Check if user has voted
    }));

    const response = { contest, participants: formatedParticipants };

    // Store in cache for 1 day
    await this.cacheManager.set(cacheKey, response);

    return response;
  }

  async getParticipantDetails(
    participantId: number,
    cookieId: string,
    fingerprintId: string,
  ) {
    // Fetch participant details
    const participant = await this.prisma.participant.findUnique({
      where: { id: participantId },
      include: { contest: true, votes: true },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }
    if (participant.contest.status === 'inactive')
      throw new BadRequestException('Contest is ended!!');

    // Get total votes
    const totalVotes = participant.votes.length;

    // Check if the user has voted for this participant
    let isVoted = await this.prisma.vote.findFirst({
      where: { participantId, cookieId },
    });
    if (!isVoted) {
      isVoted = await this.prisma.vote.findFirst({
        where: { participantId, fingerprintId },
      });
    }

    // Get participant ranking based on votes
    const rankings = await this.prisma.participant.findMany({
      where: { contestId: participant.contestId },
      include: { votes: true },
      orderBy: { votes: { _count: 'desc' } },
    });

    // Find participant's rank
    const position = rankings.findIndex((p) => p.id === participantId) + 1;

    return {
      name: `${participant.babyName}`, // Full name
      age: formatDistanceToNowStrict(new Date(participant.babyDob)), // Age calculation
      gender: participant.babyGender,
      votes: totalVotes,
      position: position,
      image: participant.babyImage,
      contestName: participant.contest.name,
      contestStartDate: participant.contest.startDate,
      contestEndDate: participant.contest.endDate,
      contestStatus: participant.contest.status,
      isVoted: !!isVoted, // Boolean value
    };
  }

  async getLeaderboard(contestId: number) {
    const cacheKey = `leaderboard_${contestId}`;

    // Check cache first
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) return cachedData;

    // Fetch participants sorted by votes (descending order)
    const participants = await this.prisma.participant.findMany({
      where: { contestId },
      include: { votes: true, contest: true },
      orderBy: { votes: { _count: 'desc' } }, // Sorting based on number of votes
    });

    if (!participants.length) {
      throw new NotFoundException('No participants found for this contest');
    }

    // Format leaderboard response
    const leaderboard = participants.map((participant, index) => ({
      id: participant.id,
      rank: index + 1, // Rank based on order
      name: `${participant.babyName}`, // Full name
      age: formatDistanceToNowStrict(new Date(participant.babyDob)), // Age in months
      votes: participant.votes.length,
      image: participant.babyImage,
    }));

    const leaderboardResponse = {
      contest: participants[0]?.contest,
      leaderboard,
    };

    // Cache leaderboard data for 1 day
    await this.cacheManager.set(cacheKey, leaderboardResponse); // 1 day = 86400 seconds

    return leaderboardResponse;
  }
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as cron from 'node-cron';

@Injectable()
export class ContestCronService implements OnModuleInit {
  private readonly logger = new Logger(ContestCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.startCronJob();
  }

  startCronJob() {
    cron.schedule('* * * * *', async () => {
      this.logger.log('Running contest status update cron job...');
      const now = new Date();

      try {
        // Update contests to active if current time is between startDate and endDate
        await this.prisma.contest.updateMany({
          where: {
            status: 'upcoming',
            startDate: { lte: now },
            endDate: { gte: now },
          },
          data: { status: 'active' },
        });

        // Update contests to inactive if current time is past endDate
        await this.prisma.contest.updateMany({
          where: {
            status: { in: ['upcoming', 'active'] },
            endDate: { lt: now },
          },
          data: { status: 'inactive' },
        });

        this.logger.log('Contest statuses updated successfully.');
      } catch (error) {
        this.logger.error('Error updating contest statuses:', error);
      }
    });
  }
}

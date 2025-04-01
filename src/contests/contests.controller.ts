import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { ContestsService } from './contests.service';
import { Prisma } from '@prisma/client';

@Controller('contests')
export class ContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  @Post()
  create(@Body() data: Prisma.ContestCreateInput) {
    if (data.endDate) {
      data.endDate = new Date(data.endDate).toISOString(); // Ensure ISO 8601 format
    }
    if (data.startDate) {
      data.startDate = new Date(data.startDate).toISOString(); // Ensure ISO 8601 format
    }
    return this.contestsService.createContest(data);
  }

  @Get('active')
  async getActiveContest() {
    return this.contestsService.getUpcomingContest();
  }

  @Get('list')
  async getContests() {
    return this.contestsService.listContests();
  }

  @Get()
  findAll() {
    return this.contestsService.getAllContests();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contestsService.getContestById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Prisma.ContestUpdateInput) {
    if (data.endDate) {
      data.endDate = new Date(data.endDate as string).toISOString(); // Ensure ISO 8601 format
    }
    if (data.startDate) {
      data.startDate = new Date(data.startDate as string).toISOString(); // Ensure ISO 8601 format
    }
    return this.contestsService.updateContest(parseInt(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.contestsService.deleteContest(id);
  }
}

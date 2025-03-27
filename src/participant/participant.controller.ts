import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, Req, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParticipantService } from './participant.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { Request } from 'express';

@Controller('participants')
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @Post('upload/:contestId')
  @UseInterceptors(FileInterceptor('image')) // Handle single file upload
  async uploadImage(@UploadedFile() file: any, @Param('contestId') contestId: string) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const imageUrl = await this.participantService.uploadImage(file, contestId);
    return { imageUrl };
  }

  @Post('join')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async joinContest(@Req() req: Request, @Body() createParticipantDto: CreateParticipantDto) {
    const cookieId = req.cookies['vote_cookie']; // Get stored cookie
    
    if (!cookieId) {
      throw new BadRequestException('No vote cookie found. Please enable cookies.');
    }
    return this.participantService.joinContest(createParticipantDto, cookieId);
  }

  @Get('details/:participantId')
  async getParticipantDetails(@Param('participantId', ParseIntPipe) participantId: number, @Req() req: Request) {
    const cookieId = req.cookies['vote_cookie'];
    
    if (!cookieId) {
      throw new BadRequestException('Cookie ID is required');
    }

    return this.participantService.getParticipantDetails(participantId, cookieId);
  }

  @Get('leaderboard/:contestId')
  async getLeaderboard(@Param('contestId', ParseIntPipe) contestId: number) {
    return this.participantService.getLeaderboard(contestId);
  }

  @Get(':contestId')
  async getParticipants(@Req() req: Request, @Param('contestId', ParseIntPipe) contestId: number) {
    const cookieId = req.cookies['vote_cookie']; // Get stored cookie
    
    if (!cookieId) {
      throw new BadRequestException('No vote cookie found. Please enable cookies.');
    }
    return this.participantService.getParticipantsByContest(contestId, cookieId);
  }
}

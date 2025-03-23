import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Injectable,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { VerificationService } from './verification.service';
import { IsAdmin } from '../decorators/decorators';
import { VerificationStatus } from '../users/user.schema';

@Controller('api/verification')
@Injectable()
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  @Post('/request')
  async createRequest(@Body() body: { message: string }, @Req() req: any) {
    const user = req.user;

    // Check if user already has a pending or approved request
    const existingRequest = await this.verificationService.findOne({
      user: user.id,
      status: { $in: ['pending', 'approved'] },
    });

    if (existingRequest) {
      throw new HttpException(
        'You already have a pending or approved verification request',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if user is already verified
    if (user.verificationStatus === VerificationStatus.VERIFIED) {
      throw new HttpException(
        'Your account is already verified',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create verification request and update user status
    const verificationRequest = await this.verificationService.create({
      user: user.id,
      message: body.message,
    });

    // Update user's verification status to pending
    await this.verificationService['usersService'].findByIdAndUpdate(user.id, {
      verificationStatus: VerificationStatus.PENDING,
    });

    return verificationRequest;
  }

  @Get('/requests')
  @IsAdmin()
  async getAllRequests() {
    return this.verificationService.getPendingRequests();
  }

  @Get('/user/:userId')
  async getUserRequests(@Param('userId') userId: string, @Req() req: any) {
    const user = req.user;
    
    // Only admins or the user themselves can view their requests
    if (user.id !== userId && !user.isAdmin) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.verificationService.getRequestsByUser(userId);
  }

  @Put('/approve/:requestId')
  @IsAdmin()
  async approveRequest(
    @Param('requestId') requestId: string,
    @Body() body: { adminResponse?: string },
  ) {
    try {
      const request = await this.verificationService.approveRequest(
        requestId,
        body.adminResponse,
      );
      return request;
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Failed to approve request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('/reject/:requestId')
  @IsAdmin()
  async rejectRequest(
    @Param('requestId') requestId: string,
    @Body() body: { adminResponse: string },
  ) {
    if (!body.adminResponse) {
      throw new HttpException(
        'Admin response is required for rejection',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const request = await this.verificationService.rejectRequest(
        requestId,
        body.adminResponse,
      );
      return request;
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Failed to reject request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
} 
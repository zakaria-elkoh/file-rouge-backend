import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
import { VerificationRequest, VerificationRequestType, VerificationRequestStatus } from './verification-request.schema';
import UsersService from '../users/users.service';
import { VerificationStatus } from '../users/user.schema';

@Injectable()
export class VerificationService {
  constructor(
    @InjectModel('VerificationRequest') private verificationRequestModel: Model<VerificationRequestType>,
    private usersService: UsersService,
  ) {}

  async create(verificationRequest: Partial<VerificationRequest>) {
    return this.verificationRequestModel.create(verificationRequest);
  }

  async findById(id: string, options?: QueryOptions) {
    return this.verificationRequestModel.findById(id, undefined, options);
  }

  async find(query: FilterQuery<VerificationRequestType>, options?: QueryOptions) {
    return this.verificationRequestModel.find(query, undefined, options);
  }

  async findOne(query: FilterQuery<VerificationRequestType>, options?: QueryOptions) {
    return this.verificationRequestModel.findOne(query, undefined, options);
  }

  async getPendingRequests() {
    return this.verificationRequestModel
      .find({ status: VerificationRequestStatus.PENDING })
      .populate('user', '-password')
      .sort({ createdAt: -1 });
  }

  async getRequestsByUser(userId: string) {
    return this.verificationRequestModel
      .find({ user: userId })
      .sort({ createdAt: -1 });
  }

  async approveRequest(requestId: string, adminResponse?: string) {
    const request = await this.findById(requestId);
    if (!request) {
      throw new Error('Verification request not found');
    }

    // Update verification request status
    request.status = VerificationRequestStatus.APPROVED;
    if (adminResponse) {
      request.adminResponse = adminResponse;
    }
    await request.save();

    // Update user verification status
    await this.usersService.findByIdAndUpdate(request.user.toString(), {
      verificationStatus: VerificationStatus.VERIFIED,
    });

    return request;
  }

  async rejectRequest(requestId: string, adminResponse: string) {
    const request = await this.findById(requestId);
    if (!request) {
      throw new Error('Verification request not found');
    }

    // Update verification request status
    request.status = VerificationRequestStatus.REJECTED;
    request.adminResponse = adminResponse;
    await request.save();

    // Update user verification status
    await this.usersService.findByIdAndUpdate(request.user.toString(), {
      verificationStatus: VerificationStatus.REJECTED,
    });

    return request;
  }
} 
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { VerificationStatus } from '../users/user.schema';
import mongoose from 'mongoose';

describe('VerificationController', () => {
  let controller: VerificationController;
  let verificationService: jest.Mocked<VerificationService>;

  // Helper function to create a mock Mongoose document
  const createMockMongooseDoc = (data: any) => {
    return {
      ...data,
      _id: data._id || new mongoose.Types.ObjectId(),
      populate: jest.fn().mockReturnThis(),
      save: jest.fn().mockResolvedValue(data),
      toJSON: jest.fn().mockReturnValue(data),
      toObject: jest.fn().mockReturnValue(data),
    };
  };

  // Mock user for testing
  const mockUser = { 
    id: 'user123', 
    isAdmin: false,
    verificationStatus: VerificationStatus.UNVERIFIED
  };

  // Mock admin user for testing
  const mockAdmin = {
    id: 'admin123',
    isAdmin: true
  };

  beforeEach(async () => {
    // Create mock verification service
    const mockVerificationService = {
      findOne: jest.fn(),
      create: jest.fn(),
      getPendingRequests: jest.fn(),
      getRequestsByUser: jest.fn(),
      approveRequest: jest.fn(),
      rejectRequest: jest.fn(),
      usersService: {
        findByIdAndUpdate: jest.fn()
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificationController],
      providers: [
        { provide: VerificationService, useValue: mockVerificationService },
      ],
    }).compile();

    controller = module.get<VerificationController>(VerificationController);
    verificationService = module.get(VerificationService) as jest.Mocked<VerificationService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRequest', () => {
    it('should create a verification request for a valid user', async () => {
      const requestMessage = { message: 'Please verify my account' };
      const mockReq = { user: mockUser };
      const createdRequest = createMockMongooseDoc({
        _id: 'request123',
        user: mockUser.id,
        message: requestMessage.message,
        status: 'pending'
      });

      verificationService.findOne.mockResolvedValue(null);
      verificationService.create.mockResolvedValue(createdRequest);
      
      const result = await controller.createRequest(requestMessage, mockReq);

      expect(verificationService.findOne).toHaveBeenCalledWith({
        user: mockUser.id,
        status: { $in: ['pending', 'approved'] },
      });
      expect(verificationService.create).toHaveBeenCalledWith({
        user: mockUser.id,
        message: requestMessage.message,
      });
      expect(verificationService['usersService'].findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser.id,
        { verificationStatus: VerificationStatus.PENDING }
      );
      expect(result).toEqual(createdRequest);
    });

    it('should throw error if user already has a pending or approved request', async () => {
      const requestMessage = { message: 'Please verify my account' };
      const mockReq = { user: mockUser };
      const existingRequest = createMockMongooseDoc({
        _id: 'request123',
        user: mockUser.id,
        status: 'pending'
      });

      verificationService.findOne.mockResolvedValue(existingRequest);

      await expect(controller.createRequest(requestMessage, mockReq)).rejects.toThrow(
        new HttpException(
          'You already have a pending or approved verification request',
          HttpStatus.BAD_REQUEST
        )
      );
      expect(verificationService.create).not.toHaveBeenCalled();
    });

    it('should throw error if user is already verified', async () => {
      const requestMessage = { message: 'Please verify my account' };
      const verifiedUser = {
        ...mockUser,
        verificationStatus: VerificationStatus.VERIFIED
      };
      const mockReq = { user: verifiedUser };

      verificationService.findOne.mockResolvedValue(null);

      await expect(controller.createRequest(requestMessage, mockReq)).rejects.toThrow(
        new HttpException(
          'Your account is already verified',
          HttpStatus.BAD_REQUEST
        )
      );
      expect(verificationService.create).not.toHaveBeenCalled();
    });
  });

  describe('getAllRequests', () => {
    it('should return all pending requests', async () => {
      const pendingRequests = [
        createMockMongooseDoc({ _id: 'request1', status: 'pending' }),
        createMockMongooseDoc({ _id: 'request2', status: 'pending' })
      ];

      verificationService.getPendingRequests.mockResolvedValue(pendingRequests);

      const result = await controller.getAllRequests();

      expect(verificationService.getPendingRequests).toHaveBeenCalled();
      expect(result).toEqual(pendingRequests);
    });
  });

  describe('getUserRequests', () => {
    it('should return requests for a user when requested by same user', async () => {
      const userId = mockUser.id;
      const mockReq = { user: mockUser };
      const userRequests = [
        createMockMongooseDoc({ _id: 'request1', user: userId }),
        createMockMongooseDoc({ _id: 'request2', user: userId })
      ];

      verificationService.getRequestsByUser.mockResolvedValue(userRequests);

      const result = await controller.getUserRequests(userId, mockReq);

      expect(verificationService.getRequestsByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(userRequests);
    });

    it('should return requests for a user when requested by admin', async () => {
      const userId = mockUser.id;
      const mockReq = { user: mockAdmin };
      const userRequests = [
        createMockMongooseDoc({ _id: 'request1', user: userId }),
        createMockMongooseDoc({ _id: 'request2', user: userId })
      ];

      verificationService.getRequestsByUser.mockResolvedValue(userRequests);

      const result = await controller.getUserRequests(userId, mockReq);

      expect(verificationService.getRequestsByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(userRequests);
    });

    it('should throw error when another user tries to access someone else\'s requests', async () => {
      const userId = 'anotherUser456';
      const mockReq = { user: mockUser }; // Non-admin user trying to access another user's requests

      await expect(controller.getUserRequests(userId, mockReq)).rejects.toThrow(
        new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
      );
      expect(verificationService.getRequestsByUser).not.toHaveBeenCalled();
    });
  });

  describe('approveRequest', () => {
    it('should approve a verification request with optional admin response', async () => {
      const requestId = 'request123';
      const adminResponse = { adminResponse: 'Your request is approved' };
      const approvedRequest = createMockMongooseDoc({
        _id: requestId,
        status: 'approved',
        adminResponse: adminResponse.adminResponse
      });

      verificationService.approveRequest.mockResolvedValue(approvedRequest);

      const result = await controller.approveRequest(requestId, adminResponse);

      expect(verificationService.approveRequest).toHaveBeenCalledWith(
        requestId,
        adminResponse.adminResponse
      );
      expect(result).toEqual(approvedRequest);
    });

    it('should handle errors during approval process', async () => {
      const requestId = 'request123';
      const adminResponse = { adminResponse: 'Your request is approved' };
      const errorMessage = 'Request not found';

      verificationService.approveRequest.mockRejectedValue(new Error(errorMessage));

      await expect(controller.approveRequest(requestId, adminResponse)).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.BAD_REQUEST)
      );
    });
  });

  describe('rejectRequest', () => {
    it('should reject a verification request with admin response', async () => {
      const requestId = 'request123';
      const adminResponse = { adminResponse: 'Your request is rejected due to insufficient evidence' };
      const rejectedRequest = createMockMongooseDoc({
        _id: requestId,
        status: 'rejected',
        adminResponse: adminResponse.adminResponse
      });

      verificationService.rejectRequest.mockResolvedValue(rejectedRequest);

      const result = await controller.rejectRequest(requestId, adminResponse);

      expect(verificationService.rejectRequest).toHaveBeenCalledWith(
        requestId,
        adminResponse.adminResponse
      );
      expect(result).toEqual(rejectedRequest);
    });

    it('should throw error if admin response is missing when rejecting', async () => {
      const requestId = 'request123';
      const emptyResponse = { adminResponse: '' };

      await expect(controller.rejectRequest(requestId, emptyResponse)).rejects.toThrow(
        new HttpException(
          'Admin response is required for rejection',
          HttpStatus.BAD_REQUEST
        )
      );
      expect(verificationService.rejectRequest).not.toHaveBeenCalled();
    });

    it('should handle errors during rejection process', async () => {
      const requestId = 'request123';
      const adminResponse = { adminResponse: 'Your request is rejected' };
      const errorMessage = 'Failed to update request';

      verificationService.rejectRequest.mockRejectedValue(new Error(errorMessage));

      await expect(controller.rejectRequest(requestId, adminResponse)).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.BAD_REQUEST)
      );
    });
  });
}); 
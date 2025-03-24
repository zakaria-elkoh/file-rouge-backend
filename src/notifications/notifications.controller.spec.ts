import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import NotificationsController from './notifications.controller';
import { NotificationType } from './notification.schema';
import { getAdvanceResults } from '../helpers';
import mongoose from 'mongoose';

// Mock dependencies
jest.mock('../helpers', () => ({
  getAdvanceResults: jest.fn(),
}));

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationModel: jest.Mocked<Model<NotificationType>>;

  // Mock user for testing
  const mockUser = { 
    id: 'user123', 
    isAdmin: false
  };

  beforeEach(async () => {
    // Create a mock notification model
    const mockNotificationModel = {
      find: jest.fn().mockReturnThis(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      countDocuments: jest.fn().mockResolvedValue(5),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: getModelToken('Notification'),
          useValue: mockNotificationModel,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    notificationModel = module.get(getModelToken('Notification')) as jest.Mocked<Model<NotificationType>>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserNotifications', () => {
    it('should return user notifications with total unseen count', async () => {
      const mockReq = { user: mockUser };
      const mockLimit = 10;
      const mockPage = 1;
      const totalUnseen = 5;
      
      const mockNotifications = {
        results: [
          { _id: 'notif1', to: mockUser.id, from: 'user456', seen: false },
          { _id: 'notif2', to: mockUser.id, from: 'user789', seen: true }
        ],
        pagination: {
          next: { page: 2 },
          prev: null
        },
        total: 2
      };

      (getAdvanceResults as jest.Mock).mockResolvedValue(mockNotifications);
      notificationModel.countDocuments.mockResolvedValue(totalUnseen);

      const result = await controller.getUserNotifications(mockReq, mockLimit, mockPage);

      expect(notificationModel.find).toHaveBeenCalledWith({ to: mockUser.id, seen: false });
      expect(notificationModel.countDocuments).toHaveBeenCalled();
      expect(getAdvanceResults).toHaveBeenCalledWith(
        notificationModel,
        { to: mockUser.id },
        mockPage,
        mockLimit,
        { path: 'from to', select: '-password -photo' },
        undefined,
        { createdAt: -1 }
      );
      expect(result).toEqual({
        ...mockNotifications,
        totalUnseen
      });
    });

    it('should use default limit when not provided', async () => {
      const mockReq = { user: mockUser };
      const mockPage = 1;
      
      (getAdvanceResults as jest.Mock).mockResolvedValue({ results: [] });

      // Pass null instead of undefined for the limit parameter
      await controller.getUserNotifications(mockReq, null as any, mockPage);

      expect(getAdvanceResults).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        mockPage,
        10, // Default limit value
        expect.anything(),
        undefined,
        expect.anything()
      );
    });
  });

  describe('markSeen', () => {
    it('should mark a notification as seen', async () => {
      const notificationId = 'notif123';
      notificationModel.findByIdAndUpdate.mockResolvedValue({ _id: notificationId, seen: true } as any);

      await controller.markSeen(notificationId);

      expect(notificationModel.findByIdAndUpdate).toHaveBeenCalledWith(
        notificationId,
        { seen: true }
      );
    });

    it('should handle non-existent notifications gracefully', async () => {
      const notificationId = 'nonexistent';
      notificationModel.findByIdAndUpdate.mockResolvedValue(null);

      // This should not throw an error
      await controller.markSeen(notificationId);

      expect(notificationModel.findByIdAndUpdate).toHaveBeenCalledWith(
        notificationId,
        { seen: true }
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty notification lists', async () => {
      const mockReq = { user: mockUser };
      const mockLimit = 10;
      const mockPage = 1;
      
      const emptyResults = {
        results: [],
        pagination: {
          next: null,
          prev: null
        },
        total: 0
      };

      (getAdvanceResults as jest.Mock).mockResolvedValue(emptyResults);
      notificationModel.countDocuments.mockResolvedValue(0);

      const result = await controller.getUserNotifications(mockReq, mockLimit, mockPage);

      expect(result).toEqual({
        ...emptyResults,
        totalUnseen: 0
      });
    });

    it('should handle pagination correctly', async () => {
      const mockReq = { user: mockUser };
      const mockLimit = 5;
      const mockPage = 2;
      
      const paginatedResults = {
        results: [
          { _id: 'notif6', to: mockUser.id, from: 'user456', seen: false },
          { _id: 'notif7', to: mockUser.id, from: 'user789', seen: true }
        ],
        pagination: {
          next: { page: 3 },
          prev: { page: 1 }
        },
        total: 10
      };

      (getAdvanceResults as jest.Mock).mockResolvedValue(paginatedResults);
      notificationModel.countDocuments.mockResolvedValue(3);

      const result = await controller.getUserNotifications(mockReq, mockLimit, mockPage);

      expect(getAdvanceResults).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        mockPage,
        mockLimit,
        expect.anything(),
        undefined,
        expect.anything()
      );
      expect(result).toEqual({
        ...paginatedResults,
        totalUnseen: 3
      });
    });
  });
}); 
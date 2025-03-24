import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import FriendsController from './friends.controller';
import FriendsService from './friends.service';
import NotificationService from '../notifications/notifications.service';
import UsersService from '../users/users.service';
import { FriendRequestType } from './friendRequest.schema';
import { FriendshipType } from './friendship.schema';
import { NotificationTypeEnum } from '../notifications/notificationTypes';
import mongoose from 'mongoose';

describe('FriendsController', () => {
  let controller: FriendsController;
  let friendsService: jest.Mocked<FriendsService>;
  let usersService: jest.Mocked<UsersService>;
  let notificationService: jest.Mocked<NotificationService>;
  let friendRequestModel: jest.Mocked<Model<FriendRequestType>>;
  let friendshipModel: jest.Mocked<Model<FriendshipType>>;

  // Mock for process.env
  const originalEnv = process.env;
  
  // Helper function to create a mock Mongoose document
  const createMockMongooseDoc = (data: any) => {
    return {
      ...data,
      _id: data._id || new mongoose.Types.ObjectId(),
      id: data.id || String(new mongoose.Types.ObjectId()),
      populate: jest.fn().mockReturnThis(),
      deleteOne: jest.fn().mockResolvedValue({}),
      save: jest.fn().mockResolvedValue(data),
      toJSON: jest.fn().mockReturnValue(data),
      toObject: jest.fn().mockReturnValue(data),
    };
  };

  // Mock user for testing
  const mockUser = { id: 'user123' };
  const mockFriend = { id: 'friend123' };
  const mockAdmin = { id: 'admin123' };

  beforeEach(async () => {
    // Set up mock env
    process.env = { ...originalEnv, ADMIN_ID: 'admin123' };

    // Create mock models and services
    const mockFriendRequestModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      deleteOne: jest.fn(),
    };

    const mockFriendshipModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      deleteOne: jest.fn(),
    };

    const mockFriendsService = {
      getUserFriends: jest.fn(),
      isPartOfFriendRequest: jest.fn(),
      isFriedRequestRecepient: jest.fn(),
    };

    const mockUsersService = {
      findById: jest.fn(),
    };

    const mockNotificationService = {
      sendFriendRequestNotification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendsController],
      providers: [
        {
          provide: getModelToken('FriendRequest'),
          useValue: mockFriendRequestModel,
        },
        {
          provide: getModelToken('Friendship'),
          useValue: mockFriendshipModel,
        },
        {
          provide: FriendsService,
          useValue: mockFriendsService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    controller = module.get<FriendsController>(FriendsController);
    friendsService = module.get(FriendsService) as jest.Mocked<FriendsService>;
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
    notificationService = module.get(NotificationService) as jest.Mocked<NotificationService>;
    friendRequestModel = module.get(getModelToken('FriendRequest')) as jest.Mocked<Model<FriendRequestType>>;
    friendshipModel = module.get(getModelToken('Friendship')) as jest.Mocked<Model<FriendshipType>>;
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserFriends', () => {
    it('should return user friends', async () => {
      const userId = 'user123';
      const mockFriends = ['friend1', 'friend2'];
      
      friendsService.getUserFriends.mockResolvedValue(mockFriends);

      const result = await controller.getUserFriends(userId);

      expect(friendsService.getUserFriends).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockFriends);
    });
  });

  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deleteFriendship', () => {
    it('should delete a friendship', async () => {
      const userId = 'friend123';
      const mockReq = { user: mockUser };
      
      friendshipModel.deleteOne.mockResolvedValue({ deletedCount: 1 } as any);

      const result = await controller.deleteFriendship(mockReq, userId);

      expect(friendshipModel.deleteOne).toHaveBeenCalledWith({
        users: { $all: [userId, mockUser.id] }
      });
      expect(result).toBe('Friend deleted successfully');
    });

    it('should throw error when trying to delete admin friendship', async () => {
      const userId = 'admin123';
      const mockReq = { user: mockUser };

      await expect(controller.deleteFriendship(mockReq, userId)).rejects.toThrow(
        new HttpException(
          'This action cannot be performed for the admin',
          HttpStatus.BAD_REQUEST
        )
      );
      expect(friendshipModel.deleteOne).not.toHaveBeenCalled();
    });
  });

  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserSentFriendRequest', () => {
    it('should return sent friend requests', async () => {
      const mockReq = { user: mockUser };
      const sentRequests = [
        { from: mockUser.id, to: 'user1' },
        { from: mockUser.id, to: 'user2' }
      ];
      
      friendRequestModel.find.mockResolvedValue(sentRequests as any);

      const result = await controller.getUserSentFriendRequest(mockReq);

      expect(friendRequestModel.find).toHaveBeenCalledWith({ from: mockUser.id });
      expect(result).toEqual(sentRequests);
    });
  });

    
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  describe('getUserReceivedFriendRequest', () => {
    it('should return received friend requests', async () => {
      const mockReq = { user: mockUser };
      const receivedRequests = [
        { from: 'user1', to: mockUser.id },
        { from: 'user2', to: mockUser.id }
      ];
      
      friendRequestModel.find.mockResolvedValue(receivedRequests as any);

      const result = await controller.getUserReceivedFriendRequest(mockReq);

      expect(friendRequestModel.find).toHaveBeenCalledWith({ to: mockUser.id });
      expect(result).toEqual(receivedRequests);
    });
  });

    
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  describe('sendFriendRequest', () => {
    it('should send friend request successfully', async () => {
      const mockReq = { user: mockUser };
      const requestBody = { to: mockFriend.id };
      const mockSender = createMockMongooseDoc({ _id: mockUser.id });
      const mockReceiver = createMockMongooseDoc({ _id: mockFriend.id });
      const createdRequest = createMockMongooseDoc({
        _id: 'request123',
        from: mockUser.id,
        to: mockFriend.id
      });
      
      usersService.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockSender) } as any);
      
      friendRequestModel.findOne.mockResolvedValue(null);
      friendshipModel.findOne.mockResolvedValue(null);
      friendRequestModel.create.mockResolvedValue(createdRequest as any);

      const result = await controller.sendFriendRequest(requestBody, mockReq);

      expect(usersService.findById).toHaveBeenCalledWith(mockUser.id);
      expect(usersService.findById).toHaveBeenCalledWith(mockFriend.id);
      expect(friendRequestModel.findOne).toHaveBeenCalled();
      expect(friendshipModel.findOne).toHaveBeenCalled();
      expect(friendRequestModel.create).toHaveBeenCalledWith({
        from: mockUser.id,
        to: mockFriend.id
      });
      expect(notificationService.sendFriendRequestNotification).toHaveBeenCalledWith(
        mockUser.id,
        mockFriend.id,
        createdRequest.id,
        NotificationTypeEnum.friendRequest
      );
      expect(result).toEqual(createdRequest);
    });

    it('should throw error when requesting friendship with self', async () => {
      const mockReq = { user: mockUser };
      const requestBody = { to: mockUser.id }; // Same as sender
      
      await expect(controller.sendFriendRequest(requestBody, mockReq)).rejects.toThrow(
        new HttpException('The 2 ids are the same', HttpStatus.BAD_REQUEST)
      );
      expect(friendRequestModel.create).not.toHaveBeenCalled();
    });

    it('should throw error when request already exists', async () => {
      const mockReq = { user: mockUser };
      const requestBody = { to: mockFriend.id };
      const existingRequest = { from: mockUser.id, to: mockFriend.id };
      
      usersService.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockUser.id }) } as any);
      
      friendRequestModel.findOne.mockResolvedValue(existingRequest as any);

      await expect(controller.sendFriendRequest(requestBody, mockReq)).rejects.toThrow(
        new HttpException('Request already sent', HttpStatus.BAD_REQUEST)
      );
      expect(friendRequestModel.create).not.toHaveBeenCalled();
    });

    it('should throw error when users are already friends', async () => {
      const mockReq = { user: mockUser };
      const requestBody = { to: mockFriend.id };
      const existingFriendship = { users: [mockUser.id, mockFriend.id] };
      
      usersService.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockUser.id }) } as any);
      
      friendRequestModel.findOne.mockResolvedValue(null);
      friendshipModel.findOne.mockResolvedValue(existingFriendship as any);

      await expect(controller.sendFriendRequest(requestBody, mockReq)).rejects.toThrow(
        new HttpException('This user is already in your friend list', HttpStatus.BAD_REQUEST)
      );
      expect(friendRequestModel.create).not.toHaveBeenCalled();
    });
  });

    
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  describe('deleteFriendRequest', () => {
    it('should delete a friend request', async () => {
      const requestId = 'request123';
      const mockReq = { user: mockUser };
      const friendRequest = createMockMongooseDoc({
        _id: requestId,
        from: mockUser.id,
        to: 'someone'
      });
      
      friendRequestModel.findById.mockResolvedValue(friendRequest as any);
      friendsService.isPartOfFriendRequest.mockReturnValue(true);

      const result = await controller.deleteFriendRequest(requestId, mockReq);

      expect(friendRequestModel.findById).toHaveBeenCalledWith(requestId);
      expect(friendsService.isPartOfFriendRequest).toHaveBeenCalledWith(mockUser.id, friendRequest);
      expect(friendRequest.deleteOne).toHaveBeenCalled();
      expect(result).toBe('Request deleted successfully');
    });

    it('should throw error when request not found', async () => {
      const requestId = 'nonexistent';
      const mockReq = { user: mockUser };
      
      friendRequestModel.findById.mockResolvedValue(null);

      await expect(controller.deleteFriendRequest(requestId, mockReq)).rejects.toThrow(
        new HttpException('Not Found', HttpStatus.NOT_FOUND)
      );
    });

    it('should throw error when user is not part of the request', async () => {
      const requestId = 'request123';
      const mockReq = { user: mockUser };
      const friendRequest = createMockMongooseDoc({
        _id: requestId,
        from: 'someone',
        to: 'someoneelse'
      });
      
      friendRequestModel.findById.mockResolvedValue(friendRequest as any);
      friendsService.isPartOfFriendRequest.mockReturnValue(false);

      await expect(controller.deleteFriendRequest(requestId, mockReq)).rejects.toThrow(
        new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
      );
      expect(friendRequest.deleteOne).not.toHaveBeenCalled();
    });
  });

    
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  describe('acceptFriendRequest', () => {
    it('should accept a friend request', async () => {
      const requestId = 'request123';
      const mockReq = { user: mockUser };
      const friendRequest = createMockMongooseDoc({
        _id: requestId,
        from: 'sender123',
        to: mockUser.id
      });
      const newFriendship = createMockMongooseDoc({
        _id: 'friendship123',
        users: [friendRequest.from, friendRequest.to]
      });
      
      friendRequestModel.findById.mockResolvedValue(friendRequest as any);
      friendsService.isFriedRequestRecepient.mockReturnValue(true);
      friendshipModel.create.mockResolvedValue(newFriendship as any);

      const result = await controller.acceptFriendRequest(requestId, mockReq);

      expect(friendRequestModel.findById).toHaveBeenCalledWith(requestId);
      expect(friendsService.isFriedRequestRecepient).toHaveBeenCalledWith(mockUser.id, friendRequest);
      expect(friendshipModel.create).toHaveBeenCalledWith({
        users: [friendRequest.from, friendRequest.to]
      });
      expect(notificationService.sendFriendRequestNotification).toHaveBeenCalledWith(
        friendRequest.to,
        friendRequest.from,
        friendRequest.id,
        NotificationTypeEnum.friendRequestAccepted
      );
      expect(friendRequest.deleteOne).toHaveBeenCalled();
      expect(result).toEqual(newFriendship);
    });

    it('should throw error when request not found', async () => {
      const requestId = 'nonexistent';
      const mockReq = { user: mockUser };
      
      friendRequestModel.findById.mockResolvedValue(null);

      await expect(controller.acceptFriendRequest(requestId, mockReq)).rejects.toThrow(
        new HttpException('Not Found', HttpStatus.NOT_FOUND)
      );
    });

    it('should throw error when user is not the recipient of the request', async () => {
      const requestId = 'request123';
      const mockReq = { user: mockUser };
      const friendRequest = createMockMongooseDoc({
        _id: requestId,
        from: 'sender123',
        to: 'someone-else'
      });
      
      friendRequestModel.findById.mockResolvedValue(friendRequest as any);
      friendsService.isFriedRequestRecepient.mockReturnValue(false);

      await expect(controller.acceptFriendRequest(requestId, mockReq)).rejects.toThrow(
        new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
      );
      expect(friendshipModel.create).not.toHaveBeenCalled();
      expect(friendRequest.deleteOne).not.toHaveBeenCalled();
    });
  });

    
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

    
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  
    
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

    
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  
    
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

    
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

    
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  
    
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

    
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  
    
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

    
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

}); 
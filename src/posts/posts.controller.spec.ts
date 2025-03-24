import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import PostsController from './posts.controller';
import { PostsService } from './posts.service';
import FriendsService from '../friends/friends.service';
import NotificationService from '../notifications/notifications.service';
import { PhotosService } from '../photos/photos.service';
import { NotificationTypeEnum } from '../notifications/notificationTypes';
import { getAdvanceResults } from '../helpers';
import { Post } from './post.schema';
import mongoose from 'mongoose';

// Mock dependencies
jest.mock('../helpers', () => ({
  getAdvanceResults: jest.fn(),
}));

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: jest.Mocked<PostsService>;
  let friendsService: jest.Mocked<FriendsService>;
  let notificationService: jest.Mocked<NotificationService>;
  let photosService: jest.Mocked<PhotosService>;

  // Helper function to create a mock Mongoose document
  const createMockMongooseDoc = (data: any) => {
    return {
      ...data,
      _id: data._id || new mongoose.Types.ObjectId(),
      populate: jest.fn().mockReturnThis(),
      updateOne: jest.fn().mockResolvedValue({}),
      deleteOne: jest.fn().mockResolvedValue({}),
      save: jest.fn().mockResolvedValue(data),
      toJSON: jest.fn().mockReturnValue(data),
      toObject: jest.fn().mockReturnValue(data),
      // Add other Mongoose document methods as needed
    };
  };

  const mockUser = { id: 'user123', isAdmin: false };
  
  beforeEach(async () => {
    // Create mock services
    const mockPostsService = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      getPostModel: jest.fn().mockReturnValue({})
    };

    const mockFriendsService = {
      getUserFriends: jest.fn()
    };

    const mockNotificationService = {
      sendPostNotificationToFriends: jest.fn(),
      sendPostNotificationToUser: jest.fn()
    };

    const mockPhotosService = {
      create: jest.fn(),
      findById: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        { provide: PostsService, useValue: mockPostsService },
        { provide: FriendsService, useValue: mockFriendsService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: PhotosService, useValue: mockPhotosService },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get(PostsService) as jest.Mocked<PostsService>;
    friendsService = module.get(FriendsService) as jest.Mocked<FriendsService>;
    notificationService = module.get(NotificationService) as jest.Mocked<NotificationService>;
    photosService = module.get(PhotosService) as jest.Mocked<PhotosService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNewsfeedPosts', () => {
    it('should get newsfeed posts with proper query for regular user', async () => {
      const mockFriends = ['friend1', 'friend2'];
      const mockReq = { user: mockUser };
      const mockLimit = 5;
      const mockPage = 1;
      const expectedQuery = { 
        $or: [
          { user: { $in: mockFriends } }, 
          { user: mockUser.id }
        ],
        archived: { $ne: true } 
      };

      friendsService.getUserFriends.mockResolvedValue(mockFriends);
      (getAdvanceResults as jest.Mock).mockResolvedValue({ results: [] });

      await controller.getNewsfeedPosts(mockReq, mockLimit, mockPage);

      expect(friendsService.getUserFriends).toHaveBeenCalledWith(mockUser.id);
      expect(getAdvanceResults).toHaveBeenCalledWith(
        expect.anything(),
        expectedQuery,
        mockPage,
        mockLimit,
        expect.anything(),
        undefined,
        { createdAt: -1 }
      );
    });

    it('should not filter archived posts for admin users', async () => {
      const adminUser = { id: 'admin123', isAdmin: true };
      const mockFriends = ['friend1', 'friend2'];
      const mockReq = { user: adminUser };
      const mockLimit = 5;
      const mockPage = 1;
      const expectedQuery = { 
        $or: [
          { user: { $in: mockFriends } }, 
          { user: adminUser.id }
        ]
      };

      friendsService.getUserFriends.mockResolvedValue(mockFriends);
      (getAdvanceResults as jest.Mock).mockResolvedValue({ results: [] });

      await controller.getNewsfeedPosts(mockReq, mockLimit, mockPage);

      expect(getAdvanceResults).toHaveBeenCalledWith(
        expect.anything(),
        expectedQuery,
        mockPage,
        mockLimit,
        expect.anything(),
        undefined,
        { createdAt: -1 }
      );
    });
  });

  describe('getAll', () => {
    it('should get all posts for a specific user', async () => {
      const userId = 'user123';
      const mockReq = { user: mockUser };
      const expectedQuery = { user: userId, archived: { $ne: true } };

      postsService.find.mockResolvedValue([]);

      await controller.getAll(userId, mockReq);

      expect(postsService.find).toHaveBeenCalledWith(
        expectedQuery,
        expect.objectContaining({
          sort: { createdAt: -1 }
        })
      );
    });

    it('should get all posts for admin including archived', async () => {
      const userId = 'user123';
      const adminUser = { id: 'admin123', isAdmin: true };
      const mockReq = { user: adminUser };
      const expectedQuery = { user: userId };

      postsService.find.mockResolvedValue([]);

      await controller.getAll(userId, mockReq);

      expect(postsService.find).toHaveBeenCalledWith(
        expectedQuery,
        expect.objectContaining({
          sort: { createdAt: -1 }
        })
      );
    });
  });

  describe('getSingle', () => {
    it('should get a single post by id', async () => {
      const postId = 'post123';
      const mockPost = createMockMongooseDoc({ 
        _id: postId, 
        description: 'Test post' 
      });
      
      postsService.findById.mockResolvedValue(mockPost);

      const result = await controller.getSingle(postId);

      expect(postsService.findById).toHaveBeenCalledWith(postId, expect.anything());
      expect(result).toEqual(mockPost);
    });

    it('should throw exception when post not found', async () => {
      const postId = 'nonexistent';
      
      postsService.findById.mockResolvedValue(null);

      await expect(controller.getSingle(postId)).rejects.toThrow(
        new HttpException('Post not found', HttpStatus.NOT_FOUND)
      );
    });
  });

  describe('updatePost', () => {
    it('should update a post', async () => {
      const postId = 'post123';
      const updateData = { description: 'Updated description' };
      const updatedPost = createMockMongooseDoc({ 
        _id: postId, 
        ...updateData 
      });
      
      postsService.findByIdAndUpdate.mockResolvedValue(updatedPost);

      const result = await controller.updatePost(postId, updateData);

      expect(postsService.findByIdAndUpdate).toHaveBeenCalledWith(
        postId, 
        updateData, 
        expect.anything()
      );
      expect(result).toEqual(updatedPost);
    });
  });

  describe('likePost', () => {
    it('should like a post and send notification if not post creator', async () => {
      const postId = 'post123';
      const postCreatorId = 'creator123';
      const mockPost = createMockMongooseDoc({ 
        _id: postId, 
        id: postId,
        likes: [], 
        user: postCreatorId
      });
      const mockReq = { user: mockUser };
      
      postsService.findById.mockResolvedValue(mockPost);

      const result = await controller.likePost(postId, mockReq);

      expect(postsService.findById).toHaveBeenCalledWith(postId, expect.anything());
      expect(mockPost.updateOne).toHaveBeenCalledWith(
        { $push: { likes: mockUser.id } },
        { runValidators: true }
      );
      expect(notificationService.sendPostNotificationToUser).toHaveBeenCalledWith(
        mockUser.id,
        postCreatorId,
        postId,
        NotificationTypeEnum.postLike
      );
      expect(result).toBe('Post liked successfully');
    });

    it('should not send notification when user likes their own post', async () => {
      const postId = 'post123';
      const mockPost = createMockMongooseDoc({ 
        _id: postId, 
        id: postId,
        likes: [], 
        user: mockUser.id
      });
      const mockReq = { user: mockUser };
      
      postsService.findById.mockResolvedValue(mockPost);

      await controller.likePost(postId, mockReq);

      expect(notificationService.sendPostNotificationToUser).not.toHaveBeenCalled();
    });
  });

  describe('Admin Routes', () => {
    it('should archive a post', async () => {
      const postId = 'post123';
      const mockPost = createMockMongooseDoc({ 
        _id: postId, 
        description: 'Test post' 
      });
      
      postsService.findByIdAndUpdate.mockResolvedValue(mockPost);

      const result = await controller.archivePost(postId);

      expect(postsService.findByIdAndUpdate).toHaveBeenCalledWith(
        postId,
        { archived: true },
        expect.anything()
      );
      expect(result).toEqual(mockPost);
    });

    it('should unarchive a post', async () => {
      const postId = 'post123';
      const mockPost = createMockMongooseDoc({ 
        _id: postId, 
        description: 'Test post' 
      });
      
      postsService.findByIdAndUpdate.mockResolvedValue(mockPost);

      const result = await controller.unarchivePost(postId);

      expect(postsService.findByIdAndUpdate).toHaveBeenCalledWith(
        postId,
        { archived: false },
        expect.anything()
      );
      expect(result).toEqual(mockPost);
    });
  });
}); 
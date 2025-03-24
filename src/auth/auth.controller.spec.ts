import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { MongoError } from 'mongodb';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import AuthController from './auth.controller';
import AuthService from './auth.service';
import UsersService from '../users/users.service';
import FriendsService from '../friends/friends.service';
import mongoose from 'mongoose';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;
  let friendsService: FriendsService;

  // Helper function to create a mock Mongoose document
  const createMockMongooseDoc = (data: any) => {
    return {
      ...data,
      _id: data._id || new mongoose.Types.ObjectId(),
      id: data.id || String(new mongoose.Types.ObjectId()),
      toObject: jest.fn().mockReturnValue(data),
    };
  };

  // Mock data for testing
  const mockUser = createMockMongooseDoc({
    id: 'user123',
    email: 'test@example.com',
    password: 'hashedPassword',
    fullName: 'Test User'
  });

  // Save original environment
  const originalEnv = process.env;

  beforeEach(async () => {
    // Mock environment variables
    process.env.JWT_SECRET = 'test-secret';

    // Create mock services
    const mockAuthService = {
      login: jest.fn(),
    };

    const mockUsersService = {
      validate: jest.fn(),
      create: jest.fn(),
    };

    const mockFriendsService = {
      createFriendshipWithAdmin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: FriendsService, useValue: mockFriendsService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    friendsService = module.get<FriendsService>(FriendsService);

    // Mock bcrypt hash
    jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedPassword'));
    
    // Mock jwt sign
    jest.spyOn(jwt, 'sign').mockImplementation(() => 'jwt-token');
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with correct credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const expectedResponse = { token: 'some-token', user: mockUser };
      
      jest.spyOn(authService, 'login').mockResolvedValue(expectedResponse);
      
      const result = await controller.login(loginDto);
      
      expect(authService.login).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(result).toEqual(expectedResponse);
    });
  });

  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('loadUser', () => {
    it('should return the user from request object', async () => {
      const req = { user: mockUser };
      
      const result = await controller.loadUser(req);
      
      expect(result).toEqual(mockUser);
    });
  });

  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
}); 
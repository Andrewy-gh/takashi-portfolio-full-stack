import { expect, describe, it, afterAll, beforeAll, beforeEach } from 'vitest';
import { connect, disconnect } from 'mongoose';
import { Session } from '@/models/session.js';
import { User } from '@/models/user.js';
import {
  generateSessionToken,
  createSession,
  validateSessionToken,
  invalidateSession,
} from '@/session.js';

describe('Session Management', () => {
  let testUser: any;

  beforeAll(async () => {
    await connect('mongodb://localhost:27017/'); // local dev database
    // Create our single test user
    testUser = new User({
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
    });
    await testUser.save();
  });

  afterAll(async () => {
    // Clean up test user
    await User.findByIdAndDelete(testUser._id);
    await disconnect();
  });

  beforeEach(async () => {
    // Clean up only sessions before each test
    await Session.deleteMany({});
  });

  it('complete session lifecycle', async () => {
    // Generate token
    const token = generateSessionToken();
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    // Create session
    const session = await createSession(token, testUser._id);
    expect(session.user.toString()).toBe(testUser._id.toString());

    // Validate session
    const validationResult = await validateSessionToken(token);
    expect(validationResult.session).toBeDefined();
    expect(validationResult.user).toBeDefined();
    expect(validationResult.user!.email).toBe('test@example.com');

    // Invalidate session
    await invalidateSession(session._id as unknown as string);
    const foundSession = await Session.findById(session._id);
    expect(foundSession).toBeNull();
  });
  it('validates invalid token returns null', async () => {
    const result = await validateSessionToken('invalid-token');
    expect(result.session).toBeNull();
    expect(result.user).toBeNull();
  });
});

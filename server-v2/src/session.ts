import { Types } from 'mongoose';
import type { IUser } from './models/user.js';
import { type ISession, Session } from './models/session.js';
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  token: string,
  user: Types.ObjectId
): Promise<ISession> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session = new Session({
    sessionId,
    user,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  });
  await session.save();
  return session;
}

export async function validateSessionToken(
  token: string
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session = await Session.findOne({ sessionId }).populate<{
    user: IUser;
  }>('user');

  if (!session) {
    return { session: null, user: null };
  }
  const user = session.user;
  if (Date.now() >= session.expiresAt.getTime()) {
    await Session.deleteOne({ _id: session._id });
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await session.save();
  }
  return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await Session.findByIdAndDelete(sessionId);
}

export type SessionValidationResult =
  | { session: ISession; user: IUser }
  | { session: null; user: null };

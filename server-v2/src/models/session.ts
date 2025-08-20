import { type Document, Schema, model } from 'mongoose';
import { type IUser, User } from './user.js';

export interface ISession extends Document {
  sessionId: string;
  // Added IUser for user reference on populate
  user: Schema.Types.ObjectId | IUser;
  expiresAt: Date;
}

const sessionSchema = new Schema({
  sessionId: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

sessionSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

export const Session = model<ISession>('Session', sessionSchema);

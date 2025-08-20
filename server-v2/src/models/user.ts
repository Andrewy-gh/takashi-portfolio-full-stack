import { type Document, type Model, type Types, Schema, model } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  role?: string;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
  },
});

userSchema.set('toJSON', {
  transform: (_document: Document, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash;
  },
});

export const User: Model<IUser> = model<IUser>('User', userSchema);

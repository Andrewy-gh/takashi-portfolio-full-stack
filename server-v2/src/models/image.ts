import { type Document, type Model, type Types, Schema, model } from 'mongoose';

export interface IImage extends Document {
  _id: Types.ObjectId;
  title: string;
  url: string;
  type?: string;
  cloudinaryId: string;
  createdAt: Date;
}

const imageSchema = new Schema<IImage>({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
  cloudinaryId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

imageSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

export const Image = model<IImage>('Image', imageSchema);

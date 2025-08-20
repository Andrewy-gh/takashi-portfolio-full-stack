import { model, Schema, Document, Types } from 'mongoose';
import { Image } from './image.js';

interface IImageOrder extends Document {
  order: Types.ObjectId[];
}

const ImageOrderSchema = new Schema<IImageOrder>({
  order: [
    {
      type: Schema.Types.ObjectId,
      ref: Image,
    },
  ],
});

ImageOrderSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

export const ImageOrder = model<IImageOrder>('ImageOrder', ImageOrderSchema);

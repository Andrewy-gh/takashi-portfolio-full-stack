import { connect, disconnect } from 'mongoose';
import { images } from './placeholder-data.js';
import { Image } from '@/models/image.js';
import { ImageOrder } from '@/models/image-order.js';

async function seedData() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
    if (!uri) {
      console.error('MONGODB_URI is not set.');
      return;
    }
    await connect(uri);
    console.log('Connected to MongoDB');
    const savedImages = await Promise.all(
      images.map(async (i) => {
        const image = new Image({
          title: i.title,
          url: i.url,
          type: i.type,
          cloudinaryId: i.cloudinaryId,
          createdAt: new Date(),
        });
        return image.save();
      })
    );
    console.log('images saved successfully', savedImages);
    let imageOrder = await ImageOrder.findOne();
    if (!imageOrder) {
      imageOrder = await new ImageOrder().save();
    }
    imageOrder.order.push(...savedImages.map((img) => img._id));
    await imageOrder.save();
    console.log('images seeded successfully', imageOrder);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedData();

import { connect, disconnect } from 'mongoose';
import { ImageOrder } from '@/models/image-order.js';
import { User } from '@/models/user.js';

async function foo() {
  try {
    const uri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdbname';
    if (!uri) {
      console.error('MONGODB_URI is not set.');
      return;
    }
    await connect(uri);
    console.log('Connected to MongoDB');
    const result = await User.findOne();
    console.log('result', result);
  } catch (error) {
  } finally {
    await disconnect();
    console.log('Disconnected from MongoDB');
  }
}

foo();

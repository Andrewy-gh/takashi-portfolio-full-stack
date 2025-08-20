import { connect, disconnect } from 'mongoose';
import { createInterface } from 'readline/promises';
import bcrypt from 'bcrypt';
import { User } from '@/models/user.js';
import { ImageOrder } from '@/models/image-order.js';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function initializeDatabase() {
  try {
    const email = await rl.question('Enter email: ');
    const password = await rl.question('Enter password: ');
    const confirmPassword = await rl.question('Confirm password: ');

    if (password !== confirmPassword) {
      console.error('Passwords do not match');
      // process.exit(1);
      return;
    }

    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
    if (!uri) {
      console.error('MONGODB_URI is not set.');
      return;
    }
    await connect(uri);
    console.log('Connected to MongoDB');

    // Create user
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = new User({
      email,
      passwordHash,
      role: 'admin', // You can modify this as needed
    });
    await user.save();
    console.log('User created successfully');

    // Create ImageOrder
    const imageOrder = new ImageOrder({ order: [] });
    await imageOrder.save();
    console.log('ImageOrder created successfully');

    await disconnect();
    console.log('Database initialization complete');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Error');
    }
  } finally {
    rl.close();
  }
}

initializeDatabase();

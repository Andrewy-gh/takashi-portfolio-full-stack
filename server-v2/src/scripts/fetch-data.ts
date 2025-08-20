import fs from 'fs';
import { connect, disconnect } from 'mongoose';
import { Image } from '@/models/image.js';

async function getData() {
  try {
    const uri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdbname';
    if (!uri) {
      console.error('MONGODB_URI is not set.');
      return;
    }
    await connect(uri);
    console.log('Connected to MongoDB');
    const images = await Image.find();
    const newData = images.map((image) => ({
      title: image.title,
      url: image.url,
      type: image.type,
      cloudinaryId: image.cloudinaryId,
    }));
    const arrayContent = JSON.stringify(newData, null, 2);
    const fileContent = `export const images = ${arrayContent};`;
    fs.writeFile('./src/scripts/placeholder-data.ts', fileContent, (err) => {
      if (err) {
        throw new Error('Error writing file:', err);
      } else {
        console.log('File written successfully: images.ts');
      }
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await disconnect();
    console.log('Disconnected from MongoDB');
  }
}

getData();

import { cors } from 'hono/cors';
import { encodeBase64 } from 'hono/utils/encode';
import { env } from 'hono/adapter';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { connect, type PipelineStage } from 'mongoose';
import { Image } from './models/image.js';
import { ImageOrder } from './models/image-order.js';
import { v2 as cloudinary } from 'cloudinary';
import {
  editImageSchema,
  imageTypeSearchSchema,
  paramsIdSchema,
  uploadSchema,
} from './schemas.js';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import {
  getCookie,
  getSignedCookie,
  setCookie,
  setSignedCookie,
  deleteCookie,
} from 'hono/cookie';

const app = new Hono();

const route = app
  .use(logger())
  .use(
    '/api/*',
    cors({
      origin: 'http://localhost:3001',
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization'],
      exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
      maxAge: 600,
      credentials: true,
    })
  )
  .use(async (_c, next) => {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });
    await next();
  })
  .post('/api/auth', zValidator('form', loginSchema), async (c) => {
    const { email, password } = c.req.valid('form');
  })
  .get('/api/images', zValidator('query', imageTypeSearchSchema), async (c) => {
    const allCookies = getCookie(c);
    console.log('allCookies', allCookies);
    const { filter } = c.req.valid('query');
    let pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'images',
          localField: 'order',
          foreignField: '_id',
          as: 'images',
        },
      },
    ];

    if (filter) {
      pipeline = pipeline.concat([
        {
          $match: {
            'images.type': filter,
          },
        },
        {
          $project: {
            order: {
              $filter: {
                input: '$images',
                as: 'image',
                cond: { $eq: ['$$image.type', filter] },
              },
            },
          },
        },
      ]);
    } else {
      pipeline.push({
        $project: {
          order: '$images',
        },
      });
    }
    const images = await ImageOrder.aggregate(pipeline);
    if (!images || !Array.isArray(images) || images.length === 0) {
      return c.json({ error: 'No images found' }, 404);
    }
    const imageOrder = images[0]?.order;
    setCookie(c, 'delicious_cookie', 'macha');
    return c.json(imageOrder, 200);
  })
  .post('/api/images', zValidator('form', uploadSchema), async (c) => {
    const { title, files, type } = c.req.valid('form');
    console.log('validated', files);

    try {
      let uploadedImages;

      if (Array.isArray(files)) {
        uploadedImages = await Promise.all(
          files.map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            const base64 = encodeBase64(arrayBuffer);
            return cloudinary.uploader.upload(
              `data:${file.type};base64,${base64}`
            );
          })
        );
      } else {
        const arrayBuffer = await files.arrayBuffer();
        const base64 = encodeBase64(arrayBuffer);
        uploadedImages = [
          await cloudinary.uploader.upload(
            `data:${files.type};base64,${base64}`
          ),
        ];
      }

      console.log('uploadedImages', uploadedImages);

      const savedImages = await Promise.all(
        uploadedImages.map(async (res) => {
          const image = new Image({
            title: title || 'placeholder text',
            url: res.secure_url,
            type: type || undefined,
            cloudinaryId: res.public_id,
            createdAt: new Date(),
          });
          return image.save();
        })
      );

      let imageOrder = await ImageOrder.findOne();
      if (!imageOrder) {
        imageOrder = await new ImageOrder().save();
      }
      imageOrder.order.push(...savedImages.map((img) => img._id));
      await imageOrder.save();

      return c.json({ images: savedImages }, 200);
    } catch (error) {
      console.error('Error uploading images:', error);
      return c.json({ error: 'Failed to upload images' }, 500);
    }
  })
  .put(
    '/api/images/:id',
    zValidator('param', paramsIdSchema),
    zValidator('form', editImageSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const { title, type } = c.req.valid('form');
      try {
        const updatedImage = await Image.findByIdAndUpdate(
          id,
          { title, type },
          {
            new: true,
          }
        );
        if (!updatedImage) {
          return c.json({ error: 'Image not found' }, 404);
        }
        await updatedImage.save();
        return c.json({ image: updatedImage }, 200);
      } catch (error) {
        console.error('Error saving image details:', error);
        return c.json({ error: 'Failed to save image details' }, 500);
      }
    }
  )
  .delete('/api/images/:id', zValidator('param', paramsIdSchema), async (c) => {
    const { id } = c.req.valid('param');
    try {
      const deletedImage = await Image.findByIdAndDelete(id);
      if (!deletedImage) {
        return c.json({ error: 'Image not found' }, 404);
      }
      await cloudinary.uploader.destroy(deletedImage.cloudinaryId);
      return c.json({ image: deletedImage }, 200);
    } catch (error) {
      return c.json({ error: 'Failed to delete image' }, 500);
    }
  });

export type AppType = typeof route;

try {
  await connect(process.env.MONGODB_URI!);
  console.log('connected to MongoDB');
} catch (error) {
  if (error instanceof Error) {
    console.error('error connecting to MongoDB:', error.message);
  } else {
    console.error('error connecting to MongoDB');
  }
}

const port = 3000;

serve({
  fetch: app.fetch,
  port,
});

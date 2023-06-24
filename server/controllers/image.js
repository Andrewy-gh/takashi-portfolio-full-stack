const imageRouter = require('express').Router();
const upload = require('../utils/multer');
const cloudinary = require('../utils/cloudinary');
const Image = require('../models/Image');
const ImageOrder = require('../models/ImageOrder');
const config = require('../utils/config');

imageRouter.get('/', async (req, res) => {
  const images = await ImageOrder.findOne().populate('order', {
    url: 1,
    title: 1,
    type: 1,
    cloudinaryId: 1,
  });
  const imageOrder = images.order;
  res.json(imageOrder);
});

imageRouter.post('/', upload.array('file', 10), async (req, res) => {
  if (req.user === config.ADMIN_ID) {
    const imagesToUpload = req.files.map(
      async (file) => await cloudinary.uploader.upload(file.path)
    );
    const uploadedImages = await Promise.all(imagesToUpload);
    const images = uploadedImages.map(
      (image) =>
        new Image({
          title: req.body.title || 'placeholder text',
          url: image.secure_url,
          type: req.body.type,
          cloudinaryId: image.public_id,
          createdAt: new Date(),
        })
    );
    const imagesToBeSaved = images.map((image) => image.save());
    const savedImages = await Promise.all(imagesToBeSaved);
    const imageOrder = await ImageOrder.findOne();
    imageOrder.order.push(...savedImages);
    await imageOrder.save();
    res.status(201).json({
      success: true,
      message: 'Successfully uploaded',
      images: savedImages,
    });
  } else {
    res.status(401).json({ error: 'unauthorized user' });
  }
});

module.exports = imageRouter;

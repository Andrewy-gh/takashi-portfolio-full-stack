const cloudinary = require('../utils/cloudinary');
const Image = require('../models/Image');
const ImageOrder = require('../models/ImageOrder');
const AppError = require('../utils/AppError');

const getImageOrder = async (req, res) => {
  const images = await ImageOrder.findOne().populate('order', {
    url: 1,
    title: 1,
    type: 1,
    cloudinaryId: 1,
  });
  const imageOrder = images?.order;
  res.json(imageOrder);
};

const addNewImages = async (req, res) => {
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
    data: savedImages,
  });
};

const updateImageOrder = async (req, res) => {
  const updatedOrder = req.body;
  const ids = updatedOrder.map((b) => b.id);
  const imageOrder = await ImageOrder.findOne();
  imageOrder.order = ids;
  await imageOrder.save();
  res.status(200).json({
    success: true,
    message: 'Image order updated',
    data: updatedOrder,
  });
};

const updateImageDetails = async (req, res) => {
  const updatedImage = await Image.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  await updatedImage.save();
  res.status(200).json({
    success: true,
    message: 'Image details updated',
    data: updatedImage,
  });
};

const removeOneImage = async (req, res) => {
  const image = await Image.findByIdAndRemove(req.params.id);
  await cloudinary.uploader.destroy(image.cloudinaryId);
  const imageOrder = await ImageOrder.findOne();
  const newOrder = imageOrder.order.filter(
    (id) => id.toString() !== req.params.id
  );
  imageOrder.order = newOrder;
  await imageOrder.save();
  res.status(204).end();
};

module.exports = {
  getImageOrder,
  addNewImages,
  updateImageOrder,
  updateImageDetails,
  removeOneImage,
};

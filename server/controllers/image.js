const imageRouter = require("express").Router();
const upload = require("../utils/multer");
const cloudinary = require("../utils/cloudinary");
const Image = require("../models/Image");
const ImageOrder = require("../models/ImageOrder");
const config = require("../utils/config");

imageRouter.get("/", async (request, response) => {
  const images = await ImageOrder.findOne().populate("order", {
    image: 1,
    title: 1,
    type: 1,
  });
  const imageOrder = images.order;
  response.json(imageOrder);
});

imageRouter.post("/", upload.array("file", 10), async (req, res) => {
  if (req.user === config.ADMIN_ID) {
    const files = req.files.map((file) =>
      cloudinary.uploader.upload(file.path)
    );
    const results = await Promise.all(files);
    const images = results.map(
      (result) =>
        new Image({
          title: req.body.title || "placeholder text",
          image: result.secure_url,
          type: req.body.type,
          cloudinaryId: result.public_id,
          createdAt: new Date(),
        })
    );
    const imagesToBeSaved = images.map((image) => image.save());
    const savedImages = await Promise.all(imagesToBeSaved);
    const imageOrder = await ImageOrder.findOne();
    imageOrder.order.push(...savedImages);
    await imageOrder.save();
    response.status(201).json({
      success: true,
      message: "Successfully uploaded",
      images: savedImages,
    });
  } else {
    response.status(401).json({ error: "unauthorized user" });
  }
});

module.exports = imageRouter;

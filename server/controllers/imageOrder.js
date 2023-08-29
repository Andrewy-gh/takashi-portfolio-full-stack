const ImageOrder = require('../models/ImageOrder');

// Send a POST request first before uploading to set up image order
const createImageOrder = async (request, response) => {
  const imageOrder = new ImageOrder({});
  await imageOrder.save();
  response.status(201).json(imageOrder);
};

module.exports = { createImageOrder };

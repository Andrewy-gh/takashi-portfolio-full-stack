require('dotenv').config();
const cloudinaryRouter = require('express').Router();

cloudinaryRouter.get('/', async (req, res) => {
  res.json(process.env.CLOUD_NAME);
});

module.exports = cloudinaryRouter;

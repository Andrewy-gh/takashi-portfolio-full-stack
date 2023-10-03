require('dotenv').config();
const express = require('express');
require('express-async-errors');
const app = express();
const cors = require('cors');
const corsOptions = require('./utils/corsOptions');
const config = require('./utils/config');
const middleware = require('./utils/middleware');
const logger = require('./utils/logger');
const path = require('path');
const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message);
  });

config.initializeApp();
app.use(cors(corsOptions));
app.use(express.static('dist'));
app.use(express.json());

app.use('/api/cloudinary', require('./routes/cloudinary'));
app.use('/auth', require('./routes/auth'));
app.use('/api/config', require('./routes/config'));
app.use('/api/images', require('./routes/images'));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
app.use(middleware.errorHandler);

module.exports = app;

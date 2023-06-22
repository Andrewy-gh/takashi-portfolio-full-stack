const config = require('./utils/config');
const express = require('express');
require('express-async-errors');
const app = express();
const cors = require('cors');
const passportSetup = require('./utils/passport');
const passport = require('passport');

// TODO: insert routers

const middleware = require('./utils/middleware');
const logger = require('./utils/logger');
const mongoose = require('mongoose');

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message);
  });

app.use(passport.initialize());
app.use(
  cors({
    origin: config.CLIENT_URL,
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  })
);
app.use(express.static('build'));
app.use(express.json());
app.use(middleware.requestLogger);

// TODO: insert routers and middleware

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;

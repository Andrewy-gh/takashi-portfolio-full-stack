const logger = require('./logger');
const jwt = require('jsonwebtoken');
const AppError = require('./AppError');

const requestLogger = (req, res, next) => {
  // prevents logging of user information
  if (req.path !== '/auth') {
    logger.info('Method:', req.method);
    logger.info('Path:  ', req.path);
    logger.info('Body:  ', req.body);
    logger.info('---');
  }
  next();
};

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Unauthorized');
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      next(err);
    }
    if (decoded.id !== process.env.ADMIN_ID) {
      throw new AppError(401, 'Unauthorized');
    }
    next();
  });
};

const errorHandler = (err, req, res, next) => {
  logger.error(err.message);

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  } else if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'invalid token',
    });
  } else if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'token expired',
    });
  } else if (err instanceof AppError) {
    return res.sendStatus(err.statusCode).json({ error: err.message });
  }

  return res.status(500).json({ error: 'Something went wrong' });
};

module.exports = {
  requestLogger,
  verifyJWT,
  errorHandler,
};

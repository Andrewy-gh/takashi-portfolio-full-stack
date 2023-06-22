require('dotenv').config();

const CLIENT_URL =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_URL
    : process.env.PROD_URL;
const PORT = process.env.PORT;
const CALLBACK_URL =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_CALLBACK_URL
    : process.env.PROD_CALLBACK_URL;

const MONGODB_URI =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;

const ADMIN_ID = process.env.ADMIN_ID;

module.exports = {
  ADMIN_ID,
  CALLBACK_URL,
  CLIENT_URL,
  MONGODB_URI,
  PORT,
};

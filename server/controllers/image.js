const imageRouter = require('express').Router();
const upload = require('../utils/multer');
const cloudinary = require('../utils/cloudinary');
const Image = require('../models/Image');
const ImageOrder = require('../models/ImageOrder');
const config = require('../utils/config');

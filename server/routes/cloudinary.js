const express = require('express');
const router = express.Router();
const cloudinaryRouter = require('../controllers/cloudinary');

router.get('/', cloudinaryRouter.getCloudname);

module.exports = router;

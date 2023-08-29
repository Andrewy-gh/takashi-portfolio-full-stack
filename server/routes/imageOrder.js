const express = require('express');
const router = express.Router();
const imageOrderRouter = require('../controllers/imageOrder');

router.post('/', imageOrderRouter.createImageOrder);

module.exports = router;

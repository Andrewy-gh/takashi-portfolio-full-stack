const express = require('express');
const router = express.Router();
const middleware = require('../utils/middleware');
const upload = require('../utils/multer');
const imageRouter = require('../controllers/image');

router
  .route('/')
  .get(imageRouter.getImageOrder)
  .post(
    middleware.verifyJWT,
    upload.array('file', 10),
    imageRouter.addNewImages
  )
  .put(middleware.verifyJWT, imageRouter.updateImageOrder);

router
  .route('/:id')
  .put(middleware.verifyJWT, imageRouter.updateImageDetails)
  .delete(middleware.verifyJWT, imageRouter.removeOneImage);

module.exports = router;

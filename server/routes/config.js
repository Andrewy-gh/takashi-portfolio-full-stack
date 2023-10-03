const express = require('express');
const router = express.Router();
const configRouter = require('../controllers/config');
const middleware = require('../utils/middleware');

router
  .route('/admin')
  .get(configRouter.checkAdminPresence)
  .post(configRouter.createAdmin);

module.exports = router;

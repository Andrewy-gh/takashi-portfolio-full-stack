const express = require('express');
const router = express.Router();
const configRouter = require('../controllers/config');

router
  .route('/admin')
  .get(configRouter.checkAdminPresence)
  .post(configRouter.createAdmin);

module.exports = router;

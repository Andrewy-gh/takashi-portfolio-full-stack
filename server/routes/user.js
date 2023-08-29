const express = require('express');
const router = express.Router();
const userRouter = require('../controllers/user');

router.post('/', userRouter.createAdmin);

module.exports = router;

const express = require('express');
const router = express.Router();
const authRouter = require('../controllers/auth');

router.post('/', authRouter.handleLogin);

module.exports = router;

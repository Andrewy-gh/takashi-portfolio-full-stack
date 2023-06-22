const loginRouter = require('express').Router();

loginRouter.get('/', (req, res) => {
  res.status(200).json({ url: config.CALLBACK_URL });
});

module.exports = loginRouter;

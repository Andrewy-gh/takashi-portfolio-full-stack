const authRouter = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');

authRouter.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

authRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
  }),
  (request, response) => {
    const { id, displayName } = request.user;
    // Only allows admin to log in
    if (id !== config.ADMIN_ID)
      return response.status(401).json({ error: 'unauthorized user' });
    const user = { id, displayName };
    const token = jwt.sign(
      {
        user,
      },
      process.env.SECRET,
      { expiresIn: 60 * 60 }
    );
    response.cookie('jwtPortfolioApp', token);
    response.status(200).redirect(config.CLIENT_URL);
  }
);

module.exports = authRouter;

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    throw new AppError(401, 'invalid email or password');
  }

  const accessToken = {
    id: user._id,
  };

  // token expires in 60*60 seconds, that is, in one hour
  const token = jwt.sign(accessToken, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: 60 * 60,
  });
  res.status(200).send(token);
};

module.exports = { handleLogin };

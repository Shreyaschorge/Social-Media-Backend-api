const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
  //get token
  const token = req.header('x-auth-token');

  //check token
  if (!token) {
    return res.status(401).json({ msg: 'No Token,Autherization Denied' });
  }

  //verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

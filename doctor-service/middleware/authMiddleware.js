const jwt = require('jsonwebtoken');

//Prefer the httpOnly cookie set by auth-service; fall back to the Authorization header for callers not yet migrated. (V09)
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded;
    req.rawToken = token; //Lets controllers forward the token downstream (V09)
    next();
  });
};

const authorizeRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'Forbidden' });
  next();
};

module.exports = { verifyToken, authorizeRole };
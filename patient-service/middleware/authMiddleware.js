const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const headerToken = req.headers.authorization?.split(' ')[1];
  const token = headerToken || req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded;
    req.rawToken = token; //Allows forwarding tokens downstream (V09)
    next();
  });
};

const authorizeRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'Forbidden' });
  next();
};

//Internal service key verification middleware (V06)
const verifyInternalKey = (req, res, next) => {
  const key = req.headers['x-internal-key'];
  if (!key || key !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(401).json({ message: 'Missing or invalid internal service key' });
  }
  next();
};

module.exports = { verifyToken, authorizeRole, verifyInternalKey };
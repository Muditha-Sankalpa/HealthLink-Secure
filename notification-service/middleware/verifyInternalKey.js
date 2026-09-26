//Verify the internal service key for requests coming from other services (V10)
const verifyInternalKey = (req, res, next) => {
  const key = req.headers['x-internal-key'];
  if (!key || key !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(401).json({ message: 'Missing or invalid internal service key' });
  }
  next();
};

module.exports = verifyInternalKey;
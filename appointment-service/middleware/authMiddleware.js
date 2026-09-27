const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // OAuth: fall back to the httpOnly cookie when there's no Authorization header (OAuth-authenticated users have no JWT to send)
    const headerToken = req.header('Authorization');
    const token = headerToken
        ? headerToken.split(" ")[1]
        : req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attaches { id, role } to the request
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Access Denied: Admin Privileges Required' });
    }
};

module.exports = { verifyToken, verifyAdmin };
const jwt = require('jsonwebtoken');

module.exports = function authenticate(req, res, next) {
  const hdr = req.headers.authorization || '';
  const match = hdr.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ message: 'Authorization header missing or malformed' });

  const token = match[1].trim();
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ message: 'Server misconfigured: JWT secret not set' });

  try {
    req.user = jwt.verify(token, secret); // {userId, role, ...}
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

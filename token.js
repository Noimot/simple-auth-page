const jwt = require('jsonwebtoken');
const secretKey = "noimot123";

function verifyToken(req, res, next) {
    const authorizationHeader = req.headers.authorization;
  
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: Missing or invalid token format" });
    }
    const token = authorizationHeader.split(" ")[1];
  
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        console.error(err.message);
        return res.status(403).json({ message: "Forbidden: Invalid token" });
      }
      req.user = user;
      next();
    });
  }

function generateToken(tokenData) {
    return jwt.sign(tokenData, secretKey, {
      expiresIn:  "1h",
    });
  }
module.exports = {verifyToken, generateToken};

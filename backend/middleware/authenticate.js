const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  let token;

  // check if there is a auth token
  if (req.cookies.authToken) {
    token = req.cookies.authToken;
  } 

  // if there's no token then return an error
  if (!token) {
    return res.status(401).json({error: "Access denied. No token provided."});
  }

  try {
    // decode token
    const decodedJWT = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedJWT)
    // let the other functions know which user it is
    req.user = decodedJWT;
    next();
  } catch (error) {
    return res.status(403).json({error: "Invalid or expired token"});
  }
};

module.exports = verifyToken;

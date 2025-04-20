const jwt = require('jsonwebtoken');

function redirectIfAuthenticated(req, res, next) {
  const token = req.cookies.authToken;

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.redirect("/dashboard");
    } catch (err) {
      // Token exists but is invalid — treat as not authenticated
      console.warn("Invalid token, continuing to public page...");
    }
  }

  next();
}

module.exports = redirectIfAuthenticated;

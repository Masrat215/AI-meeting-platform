const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Lets a request through only if it carries a valid login token
const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Please log in to continue" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("name email");

    if (!user) {
      return res
        .status(401)
        .json({ error: "Account not found. Please log in again" });
    }

    req.user = user;
    next();
  } catch (error) {
    // The token is expired, damaged or fake
    return res
      .status(401)
      .json({ error: "Your session has expired. Please log in again" });
  }
};

module.exports = requireAuth;
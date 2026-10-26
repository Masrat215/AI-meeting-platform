const { rateLimit } = require("express-rate-limit");

// Wrong passwords: 20 failed attempts per 15 minutes from one address.
// Successful logins are not counted.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please wait a few minutes and try again" },
});

// New accounts: 20 per hour from one address
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many accounts created. Please try again later" },
});

module.exports = { loginLimiter, registerLimiter };
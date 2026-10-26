const Meeting = require("../models/Meeting");

// Stops a user from uploading more than the daily limit
const checkUploadLimit = async (req, res, next) => {
  try {
    const limit = Number(process.env.DAILY_UPLOAD_LIMIT) || 5;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const count = await Meeting.countDocuments({
      owner: req.user._id,
      createdAt: { $gte: since },
    });

    if (count >= limit) {
      return res.status(429).json({
        error: `Daily upload limit reached (${limit} recordings per 24 hours). Please try again later.`,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkUploadLimit;
import {aj} from "../config/arcjet.js";

const arcjetMiddleware = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, {
      requested: 1,
    });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          error: "Too many requests",
          meesage: "Rate Limit Exceeded. Please try later",
        });
      } else if (decision.reason.isBot()) {
        return res.status(403).json({
          error: "Bot Access Denied",
          meesage: "Automated requests are not allowed",
        });
      }
    } else {
      return res.status(403).json({
        error: "Forbidden ",
        message: "Access denied by Security policy",
      });
    }

    // check for spofed bots
    if (
      decision.reslut.some(
        (reslut) => reslut.reason.isBot() && reslut.reason.isSpoofed()
      )
    ) {
      return res.status(403).json({
        error: "Spoof bot Detected ",
        message: "malicious bot activity ",
      });
    }
  } catch (error) {
    console.error("Arcjet error", error);
    next();
  }
  next();
};

export default arcjetMiddleware;

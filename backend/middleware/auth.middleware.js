import CustomError from "../utils/custom.error";
export const authMiddleware = (req, res, next) => {
  if (!req.auth().isAuthenticated) {
    throw new CustomError("Unauthorized- login to continue",401);
  }
  next();
};

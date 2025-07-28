export const authMiddleware = (req, res, next) => {
  if (!req.auth().isAuthenticated) {
    throw new Error("Unauthorized- login to continue");
  }
  next();
};

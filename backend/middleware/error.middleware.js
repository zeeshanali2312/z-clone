export const errorMiddleware = (err, req, res, next) => {
  console.log(`[Error] ${err}`);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    messagge: err.messagge || "Internal server error",
  });
};

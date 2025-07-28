import express from "express";
import cors from "cors";

// MY IMPORTS
import connectDB from "./config/db.js";
import { ENV } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import arcjetMiddleware from "./middleware/arcjet.middleware.js";

// variables
const app = express();
const PORT = ENV.PORT || 8000;

// GLOBAL MIDDLEWARE
app.use(cors());
app.use(express.json());


// DEFAUT ROUTE
app.get("/", (__, res) => res.json({ message: "Z-clone Api" }));

// HEALTH ROUTE
app.get("/health", (req, res) => res.json({ message: "Api is working fine" }));

// ERROR HANDLING MIDDLEWARE (must be last)
app.use(errorMiddleware);
app.use(arcjetMiddleware);

// DEFAUT ROUTE
app.get("/", (__, res) => res.json({ message: "Z-clone Api" }));

// HEALTH ROUTE
app.get("/health", (req, res) => res.json({ message: "Api is working fine" }));

// SERVER AND DB
app.listen(PORT, async () => {
  console.log(`Server Started at http://localhost:${PORT}`);
  await connectDB();
});

// server/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./config/firebaseAdmin"); // Initialize Firebase Admin SDK on start

const litterRoutes = require("./routes/litterRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/public", (req, res) => {
  res.json({ message: "Hello from a public endpoint!" });
});

app.use("/api/litters", litterRoutes); // All litter routes and sub-routes

// ... (rest of your error handlers and app.listen from previous example)
// Catch-all for 404 Not Found (if no routes matched)
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error("API Error Logged ----");
  console.error("Message:", err.message);
  if (err.status) console.error("Status:", err.status);
  if (process.env.NODE_ENV === "development" && err.stack) {
    // Only log stack in dev
    console.error("Stack:", err.stack);
  }
  console.error("--------------------");

  if (err.name === "UnauthorizedError" || err.status === 401) {
    return res
      .status(401)
      .json({ message: err.message || "Unauthorized: Invalid token" });
  }
  if (err.status === 403) {
    return res.status(403).json({ message: err.message || "Forbidden" });
  }
  if (err.status === 404) {
    return res
      .status(404)
      .json({ message: err.message || "Resource not found" });
  }

  res.status(err.status || 500).json({
    message: err.message || "An internal server error occurred.",
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("Auth0 and Firebase Admin SDK should be initialized.");
  console.log(
    "Remember to set your GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable for Firebase."
  );
});

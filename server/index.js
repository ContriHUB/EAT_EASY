const express = require("express");
require("dotenv").config(); // Load environment variables at the top

const app = express();
const REFRESH_TOKEN = process.env.REFRESH_TOKEN
  ? process.env.REFRESH_TOKEN.toString()
  : "default_refresh_token"; // Make sure this line comes after dotenv is loaded

const cookieParser = require("cookie-parser");
const cors = require("cors");
app.use(cors());

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const fileUpload = require("express-fileupload"); // Fixed typo here
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Config
const db = require("./config/db");
db.connect();
const { cloudinaryConnect } = require("./config/cloudinary");
cloudinaryConnect();

const userRoutes = require("./routes/user");
const complaintRoutes = require("./routes/complaint");
const profileRoutes = require("./routes/profile");
const menuRoutes = require("./routes/menu");
const committeeRoutes = require("./routes/committee");
const dailyExpense = require("./routes/expense");
const ratingRoutes = require("./routes/rating");

// API Routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/complaint", complaintRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/committee", committeeRoutes);
app.use("/api/v1/expense", dailyExpense);
app.use("/api/v1/rating", ratingRoutes);

// Default route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running",
  });
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

const express = require("express");
const cors = require("cors");
const router = require("./router");

const PORT = 3000;

const app = express();

// Enable CORS for all origins (for development and deployment)
app.use(cors());

// Apply JSON parsing middleware
app.use(express.json());

// Apply router
app.use("/", router);

// Serving app on defined PORT
app.listen(PORT, () => {
  console.log(`Express is running on port ${PORT}`);
});

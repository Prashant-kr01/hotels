const express = require("express");
const router = require("./router.js");

const PORT = process.env.PORT || 3000;

const app = express();

// Apply JSON parsing middleware
app.use(express.json());

// Apply router
app.use("/", router);

// Serving app on defined PORT
app.listen(PORT, () => {
  console.log(`Express is running on port ${PORT}`);
});

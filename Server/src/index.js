const express = require("express");
const router = require("./router");

const PORT = https://assignment-rho-woad.vercel.app/;

const app = express();

// Apply JSON parsing middleware
app.use(express.json());

// Apply router
app.use("/", router);

// Serving app on defined PORT
app.listen(PORT, () => {
  console.log(`Express is running on port ${PORT}`);
});

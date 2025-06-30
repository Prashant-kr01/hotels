const dotenv = require("dotenv");

dotenv.config();
// Export env variables
module.exports = {
  API_KEY: process.env.AMADEUS_API_KEY,
  API_SECRET: process.env.AMADEUS_API_SECRET,
};

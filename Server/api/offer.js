const Amadeus = require('amadeus');
const { API_KEY, API_SECRET } = require('../Server/config');

let amadeus;
function getAmadeus() {
  if (!amadeus) {
    amadeus = new Amadeus({ clientId: API_KEY, clientSecret: API_SECRET });
  }
  return amadeus;
}

module.exports = async (req, res) => {
  try {
    const { offerId } = req.query;
    const amadeus = getAmadeus();
    const response = await amadeus.shopping.hotelOffer(offerId).get();
    res.json(JSON.parse(response.body));
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
};

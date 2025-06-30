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
    const { hotelId } = req.query;
    if (!hotelId) {
      return res.status(400).json({ error: 'Missing hotelId' });
    }
    const amadeus = getAmadeus();
    let response;
    try {
      response = await Promise.race([
        amadeus.shopping.hotelOffers.get({ hotelId }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Amadeus API timeout')), 10000))
      ]);
    } catch (amadeusErr) {
      return res.status(502).json({ error: 'Amadeus API error', detail: amadeusErr.message || amadeusErr });
    }
    try {
      const offers = JSON.parse(response.body);
      if (!offers.data || !Array.isArray(offers.data) || offers.data.length === 0) {
        return res.json({ data: [], message: 'No offers found for this hotel.' });
      }
      res.json(offers);
    } catch (parseErr) {
      return res.status(500).json({ error: 'Failed to parse Amadeus response', detail: parseErr.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
};

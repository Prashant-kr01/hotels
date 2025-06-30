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
    if (req.method === 'POST') {
      const { offerId } = req.query;
      const { guests, payments } = req.body;
      const amadeus = getAmadeus();
      const response = await amadeus.booking.hotelBookings.post(
        JSON.stringify({
          data: {
            offerId,
            guests,
            payments,
          },
        })
      );
      res.json(JSON.parse(response.body));
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
};

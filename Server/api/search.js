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
  res.setHeader('Cache-Control', 'no-store');
  try {
    const { keyword } = req.query;
    if (!keyword || keyword.trim().length < 2) {
      return res.status(400).json({ error: "Missing or invalid 'keyword' parameter" });
    }
    const amadeus = getAmadeus();
    const response = await amadeus.referenceData.locations.get({
      keyword,
      subType: 'CITY',
    });
    res.json(JSON.parse(response.body));
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
};

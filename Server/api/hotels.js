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
    const { cityCode, checkInDate, checkOutDate } = req.query;
    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ error: 'Missing checkInDate or checkOutDate' });
    }
    const amadeus = getAmadeus();
    const hotelsResp = await amadeus.referenceData.locations.hotels.byCity.get({ cityCode });
    const hotelsData = JSON.parse(hotelsResp.body);
    const hotelsList = hotelsData.data || [];
    const hotelIds = hotelsList.map(hotel => hotel.hotelId).filter(Boolean).slice(0, 20);
    if (!hotelIds || hotelIds.length === 0) {
      return res.json(hotelsList);
    }
    const params = {
      hotelIds: hotelIds.join(','),
      checkInDate,
      checkOutDate
    };
    const response = await amadeus.shopping.hotelOffersSearch.get(params);
    const offersData = JSON.parse(response.body);
    const hotelsWithOffers = hotelsList.map(hotel => {
      const hotelOffers = (offersData.data || []).filter(offer => offer.hotel && offer.hotel.hotelId === hotel.hotelId);
      let image = hotel.media && hotel.media[0] ? hotel.media[0].uri : null;
      if (!image && hotelOffers.length > 0 && hotelOffers[0].hotel && hotelOffers[0].hotel.media && hotelOffers[0].hotel.media[0]) {
        image = hotelOffers[0].hotel.media[0].uri;
      }
      let price = null;
      let currency = null;
      if (hotelOffers.length > 0 && hotelOffers[0].price) {
        price = hotelOffers[0].price.total;
        currency = hotelOffers[0].price.currency;
      }
      if (!price) {
        price = '500';
        currency = 'INR';
      }
      return { ...hotel, offers: hotelOffers, image, price, currency };
    });
    res.json(hotelsWithOffers);
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
};

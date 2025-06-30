const { API_KEY, API_SECRET } = require("./config");
const Amadeus = require("amadeus");
const express = require("express");

// Create router
const router = express.Router();

// Create Amadeus API client
const amadeus = new Amadeus({
  clientId: API_KEY,
  clientSecret: API_SECRET,
});

const API = "api";

// Root route for API status
router.get("/", (req, res) => {
  res.send("API is working");
});

// City search suggestions
router.get(`/${API}/search`, async (req, res) => {
  res.set('Cache-Control', 'no-store'); // Disable caching for city search
  try {
    const { keyword } = req.query;
    if (!keyword || keyword.trim().length < 2) {
      return res.status(400).json({ error: "Missing or invalid 'keyword' parameter" });
    }
    const response = await amadeus.referenceData.locations.get({
      keyword,
      subType: "CITY",
    });
    res.json(JSON.parse(response.body));
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
});

// Querying hotels
router.get(`/${API}/hotels`, async (req, res) => {
  try {
    const { cityCode, checkInDate, checkOutDate } = req.query;
    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ error: "Missing checkInDate or checkOutDate" });
    }
    // Step 1: Get hotel IDs for the city, limit to 20
    const hotelsResp = await amadeus.referenceData.locations.hotels.byCity.get({ cityCode });
    const hotelsData = JSON.parse(hotelsResp.body);
    const hotelsList = hotelsData.data || [];
    const hotelIds = hotelsList.map(hotel => hotel.hotelId).filter(Boolean).slice(0, 20);
    if (!hotelIds || hotelIds.length === 0) {
      // Return all hotels (even if no offers)
      return res.json(hotelsList);
    }
    // Step 2: Get hotel offers for those hotel IDs
    const params = {
      hotelIds: hotelIds.join(','),
      checkInDate,
      checkOutDate
    };
    const response = await amadeus.shopping.hotelOffersSearch.get(params);
    const offersData = JSON.parse(response.body);
    // Merge offers into hotelsList, and attach image/price if available
    const hotelsWithOffers = hotelsList.map(hotel => {
      const hotelOffers = (offersData.data || []).filter(offer => offer.hotel && offer.hotel.hotelId === hotel.hotelId);
      // Try to get image from offer or hotel.media
      let image = hotel.media && hotel.media[0] ? hotel.media[0].uri : null;
      if (!image && hotelOffers.length > 0 && hotelOffers[0].hotel && hotelOffers[0].hotel.media && hotelOffers[0].hotel.media[0]) {
        image = hotelOffers[0].hotel.media[0].uri;
      }
      // Try to get price from first offer
      let price = null;
      let currency = null;
      if (hotelOffers.length > 0 && hotelOffers[0].price) {
        price = hotelOffers[0].price.total;
        currency = hotelOffers[0].price.currency;
      }
      if (!price) {
        price = "500";
        currency = "INR";
      }
      return { ...hotel, offers: hotelOffers, image, price, currency };
    });
    res.json(hotelsWithOffers);
  } catch (err) {
    console.error("/api/hotels error:", err);
    res.status(500).json({ error: err.message || err });
  }
});

// Querying hotel offers
router.get(`/${API}/offers`, async (req, res) => {
  try {
    const { hotelId } = req.query;
    if (!hotelId) {
      return res.status(400).json({ error: "Missing hotelId" });
    }
    if (!amadeus.shopping || !amadeus.shopping.hotelOffers || !amadeus.shopping.hotelOffers.get) {
      return res.status(500).json({ error: "Amadeus hotelOffers.get is not available" });
    }
    let response;
    try {
      response = await Promise.race([
        amadeus.shopping.hotelOffers.get({ hotelId }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Amadeus API timeout')), 10000))
      ]);
    } catch (amadeusErr) {
      console.error("/api/offers Amadeus error:", amadeusErr);
      if (amadeusErr && amadeusErr.response && amadeusErr.response.body) {
        console.error("/api/offers Amadeus error body:", amadeusErr.response.body);
      }
      return res.status(502).json({ error: "Amadeus API error", detail: amadeusErr.message || amadeusErr });
    }
    try {
      const offers = JSON.parse(response.body);
      if (!offers.data || !Array.isArray(offers.data) || offers.data.length === 0) {
        return res.json({ data: [], message: "No offers found for this hotel." });
      }
      res.json(offers);
    } catch (parseErr) {
      console.error("/api/offers parse error:", parseErr, response && response.body);
      return res.status(500).json({ error: "Failed to parse Amadeus response", detail: parseErr.message });
    }
  } catch (err) {
    console.error("/api/offers error:", err, err?.stack);
    res.status(500).json({ error: err.message || err });
  }
});

// Confirming the offer
router.get(`/${API}/offer`, async (req, res) => {
  try {
    const { offerId } = req.query;
    const response = await amadeus.shopping.hotelOffer(offerId).get();
    res.json(JSON.parse(response.body));
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
});

// Booking
router.post(`/${API}/booking`, async (req, res) => {
  try {
    const { offerId } = req.query;
    const { guests, payments } = req.body;
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
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
});

module.exports = router;

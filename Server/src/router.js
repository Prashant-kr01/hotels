const { API_KEY, API_SECRET } = require("./config.js");
const Amadeus = require("amadeus");
const express = require("express");
const axios = require('axios');
const qs = require('querystring');

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

// Helper: Get Amadeus OAuth2 token for v3 API
async function getAmadeusToken() {
  const res = await axios.post(
    'https://test.api.amadeus.com/v1/security/oauth2/token',
    qs.stringify({
      grant_type: 'client_credentials',
      client_id: API_KEY,
      client_secret: API_SECRET,
    }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  );
  return res.data.access_token;
}

// Helper: Get hotel offers from v3 API for multiple hotelIds
async function getHotelOffersV3(hotelIds, cityCode, checkInDate, checkOutDate) {
  const token = await getAmadeusToken();
  const res = await axios.get('https://test.api.amadeus.com/v3/shopping/hotel-offers', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'accept': 'application/vnd.amadeus+json'
    },
    params: {
      hotelIds: hotelIds.join(','),
      cityCode,
      checkInDate,
      checkOutDate
    }
  });
  return res.data;
}

// Helper: Get hotel sentiment (review/ratings) from v2 API for multiple hotelIds
async function getHotelSentimentsV2(hotelIds) {
  const token = await getAmadeusToken();
  try {
    // Try batch request first
    const res = await axios.get('https://test.api.amadeus.com/v2/e-reputation/hotel-sentiments', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/vnd.amadeus+json'
      },
      params: {
        hotelIds: hotelIds.join(',')
      }
    });
    return res.data;
  } catch (batchErr) {
    // If batch fails, try each hotelId individually
    const results = [];
    for (const hotelId of hotelIds) {
      try {
        const res = await axios.get('https://test.api.amadeus.com/v2/e-reputation/hotel-sentiments', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': 'application/vnd.amadeus+json'
          },
          params: { hotelIds: hotelId }
        });
        if (res.data && Array.isArray(res.data.data)) {
          results.push(...res.data.data);
        }
      } catch (e) {
        // Ignore errors for unsupported hotels
      }
    }
    return { data: results };
  }
}

// Querying hotels (now using v3 for offers/prices, correct endpoint)
router.get(`/${API}/hotels`, async (req, res) => {
  try {
    const { cityCode, checkInDate, checkOutDate } = req.query;
    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ error: "Missing checkInDate or checkOutDate" });
    }
    // Step 1: Get hotel IDs for the city, limit to 10 for speed
    const hotelsResp = await amadeus.referenceData.locations.hotels.byCity.get({ cityCode });
    const hotelsData = JSON.parse(hotelsResp.body);
    let hotelsList = hotelsData.data || [];
    let hotelIds = hotelsList.map(hotel => hotel.hotelId).filter(Boolean).slice(0, 10);

    // For London and Delhi, attach sentiment only for known IDs, but show all hotels
    const knownLondon = [
      'TELONMFS','PILONBHG','RTLONWAT','RILONJBG','HOLON187','AELONCNP','SJLONCLR','DKLONDSF','BBLONBTL','CTLONCMB'
    ];
    const knownNYC = [
      'GUNYCAXZ','SJNYCAJA','ICNYCCF8','FANYC100','ADNYCCTB','GUNYCAKQ','BBNYCAGE','HIJFK47B','TENYCAPA','HDNYCFJK','SJNYCAVS','HYNYCWVE','HDAYSABT','WVNYCBRY'
    ];
    if (cityCode === 'LON') {
      hotelIds = Array.from(new Set([...hotelIds, ...knownLondon]));
    } else if (cityCode === 'NYC') {
      hotelIds = Array.from(new Set([...hotelIds, ...knownNYC]));
    }
    // For Delhi, just show all hotels (no known sentiment IDs)
    if (!hotelIds || hotelIds.length === 0) {
      return res.json(hotelsList);
    }
    // Step 2: Fetch v3 offers for all hotelIds at once
    let v3data = {};
    try {
      v3data = await getHotelOffersV3(hotelIds, cityCode, checkInDate, checkOutDate);
    } catch (e) {}
    // Step 3: Fetch v2 sentiment for all hotelIds at once
    let v2sentiment = {};
    try {
      v2sentiment = await getHotelSentimentsV2(hotelIds);
    } catch (e) {}
    // Step 4: Attach price/rating/sentiment to each hotel
    const offersMap = {};
    if (v3data && v3data.data && Array.isArray(v3data.data)) {
      for (const offerObj of v3data.data) {
        if (offerObj.hotel && offerObj.hotel.hotelId) {
          offersMap[offerObj.hotel.hotelId] = offerObj;
        }
      }
    }
    const sentimentMap = {};
    if (v2sentiment && v2sentiment.data && Array.isArray(v2sentiment.data)) {
      for (const s of v2sentiment.data) {
        if (s.hotelId) {
          sentimentMap[s.hotelId] = s;
        }
      }
    }
    const hotelsWithPrice = hotelsList.map(hotel => {
      let price = null;
      let currency = null;
      let rating = hotel.rating || null;
      let overallRating = null;
      let numberOfReviews = null;
      let sentiments = null;
      const offerObj = offersMap[hotel.hotelId];
      if (offerObj && offerObj.offers && offerObj.offers.length > 0) {
        const offer = offerObj.offers[0];
        if (offer.price) {
          price = offer.price.total;
          currency = offer.price.currency;
        }
      }
      if (offerObj && offerObj.hotel && offerObj.hotel.rating) {
        rating = offerObj.hotel.rating;
      }
      const sentimentObj = sentimentMap[hotel.hotelId];
      if (sentimentObj) {
        overallRating = sentimentObj.overallRating;
        numberOfReviews = sentimentObj.numberOfReviews;
        sentiments = sentimentObj.sentiments;
      }
      return { ...hotel, price, currency, rating, overallRating, numberOfReviews, sentiments };
    });
    res.json(hotelsWithPrice);
  } catch (err) {
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
      return res.status(502).json({ error: "Amadeus API error", detail: amadeusErr.message || amadeusErr });
    }
    try {
      const offers = JSON.parse(response.body);
      if (!offers.data || !Array.isArray(offers.data) || offers.data.length === 0) {
        return res.json({ data: [], message: "No offers found for this hotel." });
      }
      res.json(offers);
    } catch (parseErr) {
      return res.status(500).json({ error: "Failed to parse Amadeus response", detail: parseErr.message });
    }
  } catch (err) {
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

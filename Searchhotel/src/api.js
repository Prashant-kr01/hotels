import axios from "axios";
const { CancelToken } = axios;
const search = (input) => {
  if (input) {
    try {
      const source = CancelToken.source();
      const request = axios.get(`/api/search?keyword=${input}`, {
        cancelToken: source.token,
      });
      return {
        async process(callback) {
          request.then((response) => {
            const json = response.data;
            if (json && json.data) {
              callback(
                json.data.map(({ address }) => {
                  return {
                    city: address.cityName,
                    code: address.cityCode,
                    country: address.countryName,
                    state: address.stateCode,
                  };
                })
              );
            }
          });
        },
        cancel() {
          source.cancel();
        },
      };
    } catch (error) {
      console.error(error);
    }
  }
  return {
    process() {
      return [];
    },
    cancel() {},
  };
};

// Helper for city autocomplete (used in Search.jsx)
export const searchCities = async (input) => {
  if (!input) return { data: [] };
  try {
    const response = await axios.get(`/api/search?keyword=${input}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return { data: [] };
  }
};

// Get hotels for a city and date range
export const getHotels = async (cityCode, checkInDate, checkOutDate) => {
  try {
    const response = await axios.get(
      `/api/hotels?cityCode=${cityCode}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
    );
    const json = response.data;
    // If the backend returns hotel offers in json.data, return as-is
    if (json && json.data && Array.isArray(json.data)) {
      return json.data;
    }
    // If the backend returns hotel offers in json (no .data), return as-is
    if (json && Array.isArray(json)) {
      return json;
    }
    // If the backend returns hotel offers in json.data.offers, return that
    if (json && json.data && json.data.offers) {
      return json.data.offers;
    }
    // Fallback: return empty array
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Get offers for a hotel
export const getOffers = async (hotelId) => {
  try {
    const response = await axios.get(`/api/offers?hotelId=${hotelId}`);
    const json = response.data;
    if (json && json.data && Array.isArray(json.data.offers)) {
      return json.data.offers;
    }
    if (json && Array.isArray(json.data)) {
      return json.data;
    }
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export { search };

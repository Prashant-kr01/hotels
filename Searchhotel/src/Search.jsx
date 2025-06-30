import React, { useState } from "react";
import { TextField, Autocomplete, CircularProgress, InputAdornment } from "@mui/material";
import { LocationOn } from "@mui/icons-material";
import { searchCities } from "./api";

const Search = ({ setCityCode }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [debounceTimer, setDebounceTimer] = useState(null);

  const handleInputChange = (event, value) => {
    if (event && event.preventDefault) event.preventDefault(); // Prevent default event behavior
    console.log("Input value:", value); // Debug log for input value
    setInputValue(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    if (value.length < 2) {
      setOptions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setDebounceTimer(
      setTimeout(async () => {
        const data = await searchCities(value);
        console.log("searchCities response:", data); // <-- debug log for raw API response
        // Defensive: handle both array and object with .data
        let cities = [];
        if (Array.isArray(data)) {
          cities = data;
        } else if (data && Array.isArray(data.data)) {
          cities = data.data;
        }
        const mappedOptions = cities.map((city) => ({
          label: city.address?.cityName || city.cityName || "",
          code: city.address?.cityCode || city.cityCode || "",
        }));
        setOptions(mappedOptions);
        console.log("Autocomplete options:", mappedOptions);
        setLoading(false);
      }, 300)
    );
  };

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.label || ""}
      isOptionEqualToValue={(option, value) => option.code === value.code}
      onInputChange={handleInputChange}
      inputValue={inputValue} // control input value
      onChange={(e, value) => setCityCode(value ? value.code : null)}
      loading={loading}
      disablePortal // help with dropdown visibility
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select a city 🌆"
          fullWidth
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn style={{ color: '#ff9800' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default Search;

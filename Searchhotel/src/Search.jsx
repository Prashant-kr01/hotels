import React, { useState, useEffect } from "react";
import { TextField, Autocomplete, CircularProgress, InputAdornment } from "@mui/material";
import { LocationOn, People } from "@mui/icons-material";
import { searchCities } from "./api";

const Search = ({ setCityCode, setNumPersons }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [numPersons, setPersons] = useState(1);

  // Fetch default suggestions on mount (e.g., for 'del')
  useEffect(() => {
    setLoading(true);
    searchCities("del").then((data) => {
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
      setLoading(false);
    });
  }, []);

  const handleInputChange = (event, value) => {
    if (event && event.preventDefault) event.preventDefault();
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
        setLoading(false);
      }, 300)
    );
  };

  // Pass number of persons to parent if setNumPersons is provided
  useEffect(() => {
    if (setNumPersons) setNumPersons(numPersons);
  }, [numPersons, setNumPersons]);

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option.label || ""}
        isOptionEqualToValue={(option, value) => option.code === value.code}
        onInputChange={handleInputChange}
        inputValue={inputValue}
        onChange={(e, value) => setCityCode(value ? value.code : null)}
        loading={loading}
        disablePortal
        style={{ flex: 2 }}
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
      <TextField
        type="number"
        label="Persons"
        value={numPersons}
        onChange={e => {
          const val = e.target.value;
          // Check for 0, 00, or any value less than 1
          if (val === "0" || val === "00" || Number(val) < 1) {
            alert("Choose number of person more then 0");
            setPersons(1);
            return;
          }
          if (val.length <= 2 && Number(val) <= 99) {
            setPersons(Number(val));
          }
        }}
        style={{ width: 120 }}
        autoComplete="off"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <People style={{ color: '#43c6ac' }} />
            </InputAdornment>
          ),
          inputProps: { min: 1, max: 99, step: 1 },
        }}
      />
    </div>
  );
};

export default Search;

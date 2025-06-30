import React, { useState } from "react";
import { Container, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Search from "./Search";
import DateFilters from "./DateFilters";
import Hotels from "./Hotels";
import dayjs from "dayjs";

const useStyles = makeStyles({
  container: {
    background: "linear-gradient(135deg, #f8ffae 0%, #43c6ac 100%)",
    minHeight: "100vh",
    padding: 32,
    borderRadius: 16,
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
    marginTop: 24,
    marginBottom: 24,
  },
  title: {
    fontWeight: 700,
    fontSize: 32,
    color: "#2d3748",
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: 1,
  },
});

const App = () => {
  const classes = useStyles();
  const [cityCode, setCityCode] = useState(null);
  const [checkInDate, setCheckInDate] = useState(dayjs());
  const [checkOutDate, setCheckOutDate] = useState(dayjs().add(1, "day"));

  return (
    <Container maxWidth="sm" className={classes.container}>
      <Typography className={classes.title}>
        🏨 Hotel Booking App <span role="img" aria-label="sparkles">✨</span>
      </Typography>
      <Search setCityCode={setCityCode} />
      <DateFilters
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        setCheckInDate={setCheckInDate}
        setCheckOutDate={setCheckOutDate}
      />
      <Hotels
        cityCode={cityCode}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
      />
    </Container>
  );
};
export default App;

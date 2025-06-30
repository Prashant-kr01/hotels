import React, { useState } from "react";
import { Container } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Search from "./Search";
import DateFilters from "./DateFilters";
import Hotels from "./Hotels";
import dayjs from "dayjs";
const useStyles = makeStyles({


  });

const App = () => {
  const classes = useStyles();
  const [cityCode, setCityCode] = useState(null);
  const [checkInDate, setCheckInDate] = useState(dayjs());
  const [checkOutDate, setCheckOutDate] = useState(dayjs().add(1, "day"));

  return (
    <Container maxWidth="sm" className={classes.container}>
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

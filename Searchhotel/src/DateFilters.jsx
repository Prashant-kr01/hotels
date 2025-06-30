import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const DateFilters = ({ checkInDate, checkOutDate, setCheckInDate, setCheckOutDate }) => {
  const minCheckIn = useRef(dayjs());
  useEffect(() => {
    const minCheckOutDate = checkInDate.add(1, "day");
    if (checkOutDate.isBefore(minCheckOutDate)) {
      setCheckOutDate(minCheckOutDate);
    }
  }, [checkInDate, checkOutDate, setCheckOutDate]);

  return (
    <Box display="flex" gap={2} mb={2}>
      <DatePicker
        label="Check In"
        value={checkInDate}
        minDate={minCheckIn.current}
        onChange={setCheckInDate}
        format="YYYY-MM-DD"
        slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
      />
      <DatePicker
        label="Check Out"
        value={checkOutDate}
        minDate={checkInDate.add(1, "day")}
        onChange={setCheckOutDate}
        format="YYYY-MM-DD"
        slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
      />
    </Box>
  );
};

export default DateFilters;

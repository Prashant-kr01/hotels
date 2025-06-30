import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  Typography,
  Button,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
  Apartment as HotelIcon,
  ExpandMore as ExpandIcon,
} from "@mui/icons-material";
import { getHotels } from "./api";
import Offers from "./Offers";
const useStyles = makeStyles((theme) => ({
  // ...
}));
const Hotels = ({ cityCode, checkInDate, checkOutDate }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [activeHotelId, setActiveHotelId] = useState(false);
  const [hotels, setHotels] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const handleChange = (hotelId) => (event, expanded) => {
    setActiveHotelId(expanded ? hotelId : false);
  };
  useEffect(() => {
    if (submitted && cityCode && checkInDate && checkOutDate) {
      setLoading(true);
      getHotels(
        cityCode,
        checkInDate.format("YYYY-MM-DD"),
        checkOutDate.format("YYYY-MM-DD")
      )
        .then((hotels) => {
          setHotels(hotels);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
        });
    } else if (!submitted) {
      setHotels(null);
    }
  }, [submitted, cityCode, checkInDate, checkOutDate]);
  const handleSubmit = () => {
    setSubmitted(true);
  };
  if (loading) {
    return <CircularProgress />;
  }
  if (hotels && hotels.length === 0) {
    return <span>NO RESULTS</span>;
  }
  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        style={{ marginBottom: 16 }}
      >
        Submit
      </Button>
      <div className={classes.hotelList}>
        {hotels &&
          hotels.map((hotel) => {
            const { name, address, hotelId, media } = hotel;
            const image = media ? media[0].uri : "";
            const active = activeHotelId === hotelId;
            return (
              <Accordion
                key={hotelId}
                expanded={active}
                onChange={handleChange(hotelId)}
              >
                <AccordionSummary expandIcon={<ExpandIcon />}>
                  <div className={classes.hotelListing}>
                    <div className={classes.hotelGraphic}>
                      {image ? (
                        <img
                          src={image}
                          alt="HOTEL"
                          className={classes.hotelImage}
                        />
                      ) : (
                        <HotelIcon className={classes.hotelIcon} />
                      )}
                    </div>
                    <div className={classes.hotelDetails}>
                      <Typography className={classes.hotelName}>
                        {name}
                        {hotel.price
                          ? ` - ${hotel.price} ${hotel.currency}`
                          : " - Price not available"}
                      </Typography>
                      <Typography
                        color="textSecondary"
                        className={classes.hotelAddress}
                      >
                        {(address && address.lines ? address.lines : []).map(
                          (line) => (
                            <span key={line}>{line}</span>
                          )
                        )}
                        <span>
                          {address ? address.cityName : ""}
                          {address && address.stateCode ? `, ${address.stateCode}` : ""}
                          {address ? ` ${address.postalCode}` : ""}
                        </span>
                      </Typography>
                    </div>
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  {hotelId ? (
                    <Offers active={active} hotelId={hotelId} />
                  ) : (
                    <span>No offers available</span>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
      </div>
    </div>
  );
};
export default Hotels ;
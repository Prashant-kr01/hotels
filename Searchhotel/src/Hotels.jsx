import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
  Apartment as HotelIcon,
  ExpandMore as ExpandIcon,
  LocalOffer as TagIcon,
} from "@mui/icons-material";
import { getHotels } from "./api";

const useStyles = makeStyles((theme) => ({
  hotelList: {
    marginTop: 24,
  },
  hotelListing: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: 8,
    background: "#fffbe7",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(255, 193, 7, 0.15)",
  },
  hotelGraphic: {
    marginRight: 12,
  },
  hotelImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    objectFit: "cover",
    border: "2px solid #43c6ac",
  },
  hotelIcon: {
    fontSize: 60,
    color: "#43c6ac",
  },
  hotelDetails: {
    flex: 1,
  },
  hotelName: {
    fontWeight: 600,
    fontSize: 20,
    color: "#ff9800",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  hotelAddress: {
    fontSize: 14,
    color: "#757575",
  },
}));

const Hotels = ({ cityCode, checkInDate, checkOutDate, numPersons }) => {
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
        checkOutDate.format("YYYY-MM-DD"),
        numPersons // Pass to API if needed
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
  }, [submitted, cityCode, checkInDate, checkOutDate, numPersons]);
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
                        {name} <span role="img" aria-label="hotel">🏩</span>
                      </Typography>
                      <Typography style={{ fontWeight: 600, color: '#00796b', fontSize: 16, marginTop: 4 }}>
                        {hotel.price && hotel.currency ? (
                          <>
                            {hotel.price} {hotel.currency} <span role="img" aria-label="money">💰</span>
                          </>
                        ) : (
                          <>Price not available <span role="img" aria-label="money">💰</span></>
                        )}
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
                  {hotel.offers && hotel.offers.length > 0 ? (
                    <List style={{ width: '100%', background: '#e0f7fa', borderRadius: 12, marginTop: 8, padding: 8 }}>
                      <Divider />
                      {hotel.offers.map((offer, idx) => (
                        <ListItem
                          alignItems="flex-start"
                          divider={idx !== hotel.offers.length - 1}
                          style={{ background: '#fff', borderRadius: 8, marginBottom: 8, boxShadow: '0 1px 4px rgba(33, 150, 243, 0.10)' }}
                          key={offer.id || idx}
                        >
                          <ListItemIcon style={{ color: '#ff9800' }}>
                            <TagIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={<span style={{ fontSize: 15, color: '#00796b' }}>{offer.room?.description?.text || 'No description'}</span>}
                            secondary={
                              <>
                                <span style={{ fontWeight: 600, color: '#00796b' }}>
                                  {offer.price?.total ? `${offer.price.total} ${offer.price.currency} ` : 'Price not available'}
                                  <span role="img" aria-label="money">💰</span>
                                </span>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
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

export default Hotels;
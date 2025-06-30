import { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { LocalOffer as TagIcon } from "@mui/icons-material";
import { getOffers } from "./api";
const useStyles = makeStyles((theme) => ({
  offerList: {
    background: "#e0f7fa",
    borderRadius: 12,
    marginTop: 8,
    padding: 8,
  },
  offerListing: {
    background: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    boxShadow: "0 1px 4px rgba(33, 150, 243, 0.10)",
  },
  offerIcon: {
    color: "#ff9800",
  },
  offerTextWrapper: {
    marginLeft: 8,
  },
  offerText: {
    fontSize: 15,
    color: "#00796b",
  },
  offerLoadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 60,
  },
}));
const Offers = ({ active, hotelId, setOfferId }) => {
  if (!hotelId) {
    // Don't render anything if hotelId is missing
    return null;
  }
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  useEffect(() => {
    if (!hotelId) {
      setOffers([]);
      setLoading(false);
      return;
    }
    if (active) {
      setLoading(true);
      getOffers(hotelId)
        .then((offers) => {
          setOffers(offers);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
        });
    } else {
      setOffers([]);
    }
  }, [active, hotelId]);
  if (loading) {
    return (
      <div className={classes.offerLoadingContainer}>
        <CircularProgress />
      </div>
    );
  }
  if (!offers.length) {
    return <span>No offers available.</span>;
  }
  return (
    <List className={classes.offerList}>
      <Divider />
      {offers.map((offer, index) => {
        const [headline, ...description] = offer.room?.description?.text?.split("\n") || ["No description"];
        return (
          <ListItem
            alignItems="flex-start"
            divider={index !== offers.length - 1}
            className={classes.offerListing}
            key={offer.id}
          >
            <ListItemIcon className={classes.offerIcon}>
              <TagIcon />
            </ListItemIcon>
            <ListItemText
              className={classes.offerTextWrapper}
              primary={<span className={classes.offerText}>{headline}</span>}
              secondary={
                <>
                  {description.map((line) => {
                    return (
                      <span key={line} className={classes.offerText}>
                        {line}
                      </span>
                    );
                  })}
                </>
              }
            />
            <div>
              <Button color="primary" variant="contained">
                {offer.price.total} {offer.price.currency} <span role="img" aria-label="money">💰</span>
              </Button>
            </div>
          </ListItem>
        );
      })}
    </List>
  );
};
export default Offers;

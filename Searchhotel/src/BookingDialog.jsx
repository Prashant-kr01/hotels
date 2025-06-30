import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

const BookingDialog = ({ offerId, setOfferId }) => {
  const handleClose = () => setOfferId(null);

  return (
    <Dialog open={!!offerId} onClose={handleClose}>
      <DialogTitle>Booking Confirmation</DialogTitle>
      <DialogContent>
        <Typography>Booking offer ID: {offerId}</Typography>
        <Typography variant="body2">This is a mock confirmation dialog.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleClose}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingDialog;
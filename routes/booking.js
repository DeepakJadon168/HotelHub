const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const bookingController = require("../controllers/booking");

// My bookings page
router.get("/my", isLoggedIn, wrapAsync(bookingController.myBookings));

// Cancel a booking
router.delete("/:bookingId", isLoggedIn, wrapAsync(bookingController.cancelBooking));

module.exports = router;
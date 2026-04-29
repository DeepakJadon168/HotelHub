const Booking = require("../models/booking");
const Listing = require("../models/listing");

module.exports.createBooking = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    if (listing.owner.equals(req.user._id)) {
        req.flash("error", "You cannot book your own listing!");
        return res.redirect(`/listings/${listing._id}`);
    }

    const { checkIn, checkOut } = req.body.booking;
    const checkInDate  = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
        req.flash("error", "Check-out date must be after check-in date");
        return res.redirect(`/listings/${listing._id}`);
    }

    if (checkInDate < new Date().setHours(0, 0, 0, 0)) {
        req.flash("error", "Check-in date cannot be in the past");
        return res.redirect(`/listings/${listing._id}`);
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * listing.price;

    const newBooking = new Booking({
        listing: listing._id,
        user: req.user._id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
    });

    await newBooking.save();
    req.flash("success", `🎉 Booking confirmed! ${nights} night(s) × ₹${listing.price} = ₹${totalPrice}`);
    res.redirect("/bookings/my");
};

module.exports.myBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate("listing")
        .sort({ createdAt: -1 });
    res.render("bookings/my.ejs", { bookings });
};

module.exports.cancelBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
                req.flash("error", "Booking not found");
        return res.redirect("/bookings/my");
    }

    if (!booking.user.equals(req.user._id)) {
        req.flash("error", "You are not authorized to cancel this booking");
        return res.redirect("/bookings/my");
    }

    await Booking.findByIdAndDelete(req.params.bookingId);
    req.flash("success", "Booking cancelled successfully");
    res.redirect("/bookings/my");
};
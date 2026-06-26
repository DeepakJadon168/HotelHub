const Booking = require("../models/booking");
const Listing = require("../models/listing");

module.exports.createBooking = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "PG Listing not found");
        return res.redirect("/listings");
    }

    if (listing.owner.equals(req.user._id)) {
        req.flash("error", "You cannot book your own PG listing!");
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

    // Calculate total days to convert into fractional months
    const totalDays = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    // Standardizing 1 month = 30 days for rent calculation
    const months = parseFloat((totalDays / 30).toFixed(1)); 
    
    // Minimum booking filter (Students usually book for at least 1 month)
    if (totalDays < 30) {
        req.flash("error", "Minimum booking duration for this PG is 1 Month (30 Days)");
        return res.redirect(`/listings/${listing._id}`);
    }

    const totalPrice = Math.ceil(months * listing.price);

    const newBooking = new Booking({
        listing: listing._id,
        user: req.user._id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
    });

    await newBooking.save();
    req.flash("success", `🎉 PG Booking Confirmed! Duration: ${months} Month(s) × ₹${listing.price}/mo = Total ₹${totalPrice}`);
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
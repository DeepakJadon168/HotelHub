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

    const overlappingBooking = await Booking.findOne({
        listing: listing._id,
        status: { $in: ["pending", "confirmed"] },
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
    });

    if (overlappingBooking) {
        req.flash("error", "This PG is already requested or booked for the selected dates.");
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
        status: "pending",
    });

    await newBooking.save();
    req.flash("success", `Booking request sent! Duration: ${months} Month(s) x ₹${listing.price}/mo = Total ₹${totalPrice}`);
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

    booking.status = "cancelled";
    await booking.save();
    req.flash("success", "Booking cancelled successfully");
    res.redirect("/bookings/my");
};

module.exports.updateBookingStatus = async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!["confirmed", "rejected"].includes(status)) {
        req.flash("error", "Invalid booking status");
        return res.redirect("/listings/dashboard/owner");
    }

    const booking = await Booking.findById(bookingId).populate("listing");
    if (!booking || !booking.listing) {
        req.flash("error", "Booking not found");
        return res.redirect("/listings/dashboard/owner");
    }

    if (!booking.listing.owner.equals(req.user._id)) {
        req.flash("error", "You are not authorized to update this booking");
        return res.redirect("/listings/dashboard/owner");
    }

    if (status === "confirmed") {
        const conflict = await Booking.findOne({
            _id: { $ne: booking._id },
            listing: booking.listing._id,
            status: "confirmed",
            checkIn: { $lt: booking.checkOut },
            checkOut: { $gt: booking.checkIn },
        });

        if (conflict) {
            req.flash("error", "Another confirmed booking already overlaps these dates.");
            return res.redirect("/listings/dashboard/owner");
        }
    }

    booking.status = status;
    await booking.save();
    req.flash("success", `Booking ${status}`);
    res.redirect("/listings/dashboard/owner");
};

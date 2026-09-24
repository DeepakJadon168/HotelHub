const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const User = require("../models/user.js");

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function normalizeListingInput(listing = {}) {
  const amenities = listing.amenities || {};
  const rules = listing.rules || {};
  listing.amenities = {
    wifi: amenities.wifi === "on",
    food: amenities.food === "on",
    ac: amenities.ac === "on",
    attachedBath: amenities.attachedBath === "on",
    parking: amenities.parking === "on",
    laundry: amenities.laundry === "on",
    powerBackup: amenities.powerBackup === "on",
    cctv: amenities.cctv === "on",
    housekeeping: amenities.housekeeping === "on",
    studyTable: amenities.studyTable === "on",
  };
  listing.rules = {
    gateTiming: rules.gateTiming || "",
    visitorsAllowed: rules.visitorsAllowed === "on",
    smokingAllowed: rules.smokingAllowed === "on",
    petsAllowed: rules.petsAllowed === "on",
    noticePeriod: rules.noticePeriod || "",
  };
  listing.securityDeposit = Number(listing.securityDeposit) || 0;
  listing.maintenanceCharge = Number(listing.maintenanceCharge) || 0;
  return listing;
}

module.exports.index = async (req, res) => {
  const {
    category,
    location,
    minPrice,
    maxPrice,
    genderPreference,
    sharingType,
    amenities,
  } = req.query;
  let filter = {};
  if (category) filter.category = category;
  if (location) filter.location = { $regex: new RegExp(escapeRegex(location), "i") };
  if (genderPreference) filter.genderPreference = genderPreference;
  if (sharingType) filter.sharingType = sharingType;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  const selectedAmenities = Array.isArray(amenities) ? amenities : amenities ? [amenities] : [];
  for (const amenity of selectedAmenities) {
    filter[`amenities.${amenity}`] = true;
  }

  const allListings = await Listing.find(filter);
  res.render("listings/index.ejs", { 
    allListings, 
    activeCategory: category || null,
    filters: req.query,
  });
};

module.exports.renderNewForm = (req, res) => { 
  res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "listing you requested for does not exist");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
}

module.exports.createListing = async (req, res, next) => {
  const newListing = new Listing(normalizeListingInput(req.body.listing));
  newListing.owner = req.user._id;

  console.log("REQ FILE:", req.file);

  const uploadedFiles = req.files && req.files.length ? req.files : req.file ? [req.file] : [];
  if (uploadedFiles.length) {
    newListing.images = uploadedFiles.map((file) => ({
      url: file.secure_url,
      filename: file.filename || file.public_id,
    }));
  newListing.image = {
      url: uploadedFiles[0].secure_url,
      filename: uploadedFiles[0].filename || uploadedFiles[0].public_id,
  };
}

  await newListing.save();
  console.log("SAVED ID:", newListing._id);
  req.flash("success", "New Listing Created");
  res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "listing you requested for does not exist");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image && listing.image.url ? listing.image.url : "";
  if (originalImageUrl) originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...normalizeListingInput(req.body.listing) }, { new: true });

  const uploadedFiles = req.files && req.files.length ? req.files : req.file ? [req.file] : [];
  if (uploadedFiles.length) {
    listing.images = uploadedFiles.map((file) => ({
      url: file.secure_url,
      filename: file.filename || file.public_id,
    }));
    listing.image = {
      url: uploadedFiles[0].secure_url,
      filename: uploadedFiles[0].filename || uploadedFiles[0].public_id,
    };
    await listing.save();
  }

  req.flash("success", "listing is updated");
  res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "listing Deleted");
  res.redirect("/listings");
}

module.exports.toggleWishlist = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);
  const alreadySaved = user.wishlist.some((listingId) => listingId.equals(id));

  if (alreadySaved) {
    user.wishlist.pull(id);
    req.flash("success", "Removed from wishlist");
  } else {
    user.wishlist.push(id);
    req.flash("success", "Saved to wishlist");
  }

  await user.save();
  res.redirect(req.get("Referrer") || `/listings/${id}`);
};

module.exports.wishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.render("listings/wishlist.ejs", { savedListings: user.wishlist || [] });
};

module.exports.reportListing = async (req, res) => {
  const { id } = req.params;
  const reason = req.body.reason || "Reported by user";
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  listing.reports.push({ user: req.user._id, reason });
  await listing.save();
  req.flash("success", "Thanks, this listing has been reported for review.");
  res.redirect(`/listings/${id}`);
};

module.exports.ownerDashboard = async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id });
  const listingIds = listings.map((listing) => listing._id);
  const bookings = await Booking.find({ listing: { $in: listingIds } })
    .populate("listing")
    .populate("user")
    .sort({ createdAt: -1 });
  const activeBookings = bookings.filter((booking) => booking.status === "confirmed");
  const pendingBookings = bookings.filter((booking) => booking.status === "pending");
  const totalEarnings = activeBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

  res.render("listings/owner-dashboard.ejs", {
    listings,
    bookings,
    activeBookings,
    pendingBookings,
    totalEarnings,
  });
};

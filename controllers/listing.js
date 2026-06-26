const Listing = require("../models/listing.js")

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports.index = async (req, res) => {
  const { category, location } = req.query;
  let filter = {};
  if (category) filter.category = category;
  if (location) filter.location = { $regex: new RegExp(escapeRegex(location), "i") };

  const allListings = await Listing.find(filter);
  res.render("listings/index.ejs", { 
    allListings, 
    activeCategory: category || null 
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
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  console.log("REQ FILE:", req.file);

  if (req.file) {
  newListing.image = {
    url: req.file.secure_url,  // ✅ secure_url use karo
    filename: req.file.filename || req.file.public_id,
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
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

  if (req.file) {
    listing.image = {
      url: req.file.secure_url,  // ✅ secure_url use karo
      filename: req.file.filename || req.file.public_id,
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
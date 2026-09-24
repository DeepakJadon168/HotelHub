const express= require("express");
const router= express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
const Listing= require("../models/listing.js");
const { isLoggedIn,isOwner,validateListing}= require("../middleware.js");
// controller file is singular 'listing.js'
const listingController = require("../controllers/listing.js");
const bookingController = require("../controllers/booking.js");
const multer= require("multer");
const {storage}=require("../cloudconfig.js");
const upload= multer({ storage});

//index and create route
    router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,   //user logged in h
        upload.array("listing[image]", 6), //multer process image ko
        validateListing, //validate karega listing ko
        wrapAsync(listingController.createListing)  //phir ham controller ke andr create listing bale callback ko execute karege
    );
  

//New Route
router.get("/new",isLoggedIn,listingController.renderNewForm)
router.get("/wishlist", isLoggedIn, wrapAsync(listingController.wishlist));
router.get("/dashboard/owner", isLoggedIn, wrapAsync(listingController.ownerDashboard));

router.post("/:id/book",
    isLoggedIn,
    wrapAsync(bookingController.createBooking)
); 

router.post("/:id/wishlist", isLoggedIn, wrapAsync(listingController.toggleWishlist));
router.post("/:id/report", isLoggedIn, wrapAsync(listingController.reportListing));


//show update and delete Route
    router.route("/:id")
            .get(wrapAsync(listingController.showListing ))
            .put(
                isLoggedIn,
                isOwner,
                upload.array("listing[image]", 6),
                validateListing,
                wrapAsync(listingController.updateListing))
            .delete(
                isLoggedIn,
                isOwner,
                 wrapAsync(listingController.deleteListing)
            );

   

//edit Route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm));


module.exports=router;

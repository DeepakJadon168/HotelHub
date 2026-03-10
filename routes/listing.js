const express= require("express");
const router= express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
const Listing= require("../models/listing.js");
const { isLoggedIn,isOwner,validateListing}= require("../middleware.js");
const listingController= require("../controllers/listing.js");
const multer= require("multer");
const {storage}=require("../cloudconfig.js");
const upload= multer({ storage});

//index and create route
    router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,   //user logged in h
        upload.single("listing[image]"), //multer process image ko
        validateListing, //validate karega listing ko
        wrapAsync(listingController.createListing)  //phir ham controller ke andr create listing bale callback ko execute karege
    );
  

//New Route
router.get("/new",isLoggedIn,listingController.renderNewForm)


//show update and delete Route
    router.route("/:id")
            .get(wrapAsync(listingController.showListing ))
            .put(
                isLoggedIn,
                isOwner,
                upload.single("listing[image]"),
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
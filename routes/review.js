const express= require("express");
const router= express.Router({mergeParams: true});
const wrapAsync= require("../utils/wrapAsync.js");
const ExpressError= require("../utils/ExpressError.js");
const Review= require("../models/review.js");
const Listing= require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor }= require("../middleware.js");
// controller file is singular 'review.js'
const reviewController = require("../controllers/review.js");
// optional shorthand if you only need one export:
// const { createReview } = reviewController;

//validate listing

//Reviews
//Post Route
router.post("/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createReview ));

//Delete reviw route
router.delete("/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.deleteReview) 
);

module.exports=router;
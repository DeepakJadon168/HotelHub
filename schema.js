const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.object({
            url: Joi.string().allow("", null),
            filename: Joi.string().allow("", null),
        }).allow(null),
        category: Joi.string().allow("", null),
        contact: Joi.string().allow("", null),
        genderPreference: Joi.string().allow("", null),
        sharingType: Joi.string().allow("", null),
        securityDeposit: Joi.number().allow("", null),
        nearbyLandmark: Joi.string().allow("", null),
        maintenanceCharge: Joi.number().allow("", null),
        amenities: Joi.object({
            wifi: Joi.any(),
            food: Joi.any(),
            ac: Joi.any(),
            attachedBath: Joi.any(),
            parking: Joi.any(),
            laundry: Joi.any(),
            powerBackup: Joi.any(),
            cctv: Joi.any(),
            housekeeping: Joi.any(),
            studyTable: Joi.any(),
        }).allow(null),
        rules: Joi.object({
            gateTiming: Joi.string().allow("", null),
            visitorsAllowed: Joi.any(),
            smokingAllowed: Joi.any(),
            petsAllowed: Joi.any(),
            noticePeriod: Joi.string().allow("", null),
        }).allow(null),
    }).required()
}).unknown(true);

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});

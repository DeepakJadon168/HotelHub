const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  images: [
    {
      url: String,
      filename: String,
    },
  ],
  price: Number,
  location: String,
  country: String,
  category: {
    type: String,
    default: "rooms",
  },
  genderPreference: {
    type: String,
    enum: ["boys", "girls", "co-ed", ""],
    default: "",
  },
  sharingType: {
    type: String,
    enum: ["single", "double", "triple", "dorm", ""],
    default: "",
  },
  securityDeposit: {
    type: Number,
    default: 0,
  },
  amenities: {
    wifi: { type: Boolean, default: false },
    food: { type: Boolean, default: false },
    ac: { type: Boolean, default: false },
    attachedBath: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    laundry: { type: Boolean, default: false },
    powerBackup: { type: Boolean, default: false },
    cctv: { type: Boolean, default: false },
    housekeeping: { type: Boolean, default: false },
    studyTable: { type: Boolean, default: false },
  },
  rules: {
    gateTiming: String,
    visitorsAllowed: { type: Boolean, default: false },
    smokingAllowed: { type: Boolean, default: false },
    petsAllowed: { type: Boolean, default: false },
    noticePeriod: String,
  },
  nearbyLandmark: String,
  maintenanceCharge: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  reports: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      reason: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  contact: {
    type: String,
    required: true,
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

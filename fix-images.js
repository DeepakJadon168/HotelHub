// fix-images.js — root folder mein banao, ek baar node fix-images.js chalao
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

mongoose.connect( dbUrl); // apna URL daal

async function fix() {
  const listings = await Listing.find({});
  for (let l of listings) {
    if (l.image && l.image.toString().includes("[object Object]")) {
      l.image = "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80";
      await l.save();
      console.log("Fixed:", l.title);
    }
  }
  console.log("Done!");
  mongoose.connection.close();
}

fix();
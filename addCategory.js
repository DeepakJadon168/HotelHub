require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('./models/listing');

const dbUrl = process.env.ATLASDB_URL || 'mongodb://127.0.0.1:27017/Wanderlust';

const categories = ["trending", "rooms", "cities", "mountain", "castles", "arctic", "camping", "farms", "snow", "domes", "boats"];

async function main() {
    await mongoose.connect(dbUrl);
    console.log("DB connected");

    // Get all listings that don't have a category
    const listingsWithoutCategory = await Listing.find({ category: { $exists: false } });

    console.log(`Found ${listingsWithoutCategory.length} listings without categories`);

    for (let i = 0; i < listingsWithoutCategory.length; i++) {
        const listing = listingsWithoutCategory[i];
        // Assign a random category
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];

        await Listing.findByIdAndUpdate(listing._id, { category: randomCategory });
        console.log(`Updated: ${listing.title} → ${randomCategory}`);
    }

    console.log("All done!");
    mongoose.connection.close();
}

main().catch(console.error);
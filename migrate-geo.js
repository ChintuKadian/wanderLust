const mongoose = require("mongoose");
const Listing = require("./models/listing");
const geocodeLocation = require("./utils/geocode");
require("dotenv").config();

async function runMigration() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
    console.log("Connected to DB");

    const listings = await Listing.find({
      $or: [
        { geometry: { $exists: false } },
        { geometry: null }
      ]
    });

    console.log(`Found ${listings.length} listings to update`);

    for (let listing of listings) {
      console.log(`Geocoding: ${listing.location}, ${listing.country}`);

      const coords = await geocodeLocation(
        listing.location,
        listing.country
      );

      if (coords) {
        listing.geometry = coords;
        await listing.save();
        console.log("Updated successfully");
      } else {
        console.log("Geocoding failed");
      }
    }

    console.log("Migration complete");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runMigration();

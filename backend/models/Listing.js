import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    txnType: {
      type: String,
      enum: ["sale", "rent_long", "rent_short"],
      required: true,
    },
    propertyType: {
      type: String,
      enum: ["house", "apartment", "plot", "commercial", "room"],
      required: true,
    },
    city: { type: String, required: true, trim: true },
    locality: { type: String, required: true, trim: true },
    address: { type: String, default: "" },

    location: {
      type: { type: String, enum: ["Point"] },
      coordinates: { type: [Number] },
    },

    area: { type: Number, required: true },
    areaUnit: {
      type: String,
      enum: ["sqft", "marla", "kanal", "sqyd"],
      default: "sqft",
    },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "inactive", "sold", "rented"],
      default: "pending",
    },
    isFeatured: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
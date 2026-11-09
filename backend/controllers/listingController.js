import Listing from "../models/Listing.js";
import Media from "../models/Media.js";
import cloudinary from "../config/cloudinary.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

// POST /api/listings (form-data, files in "media")
export const createListing = async (req, res) => {
  try {
    const {
      title, description, price, txnType, propertyType, city, locality,
      address, area, areaUnit, bedrooms, bathrooms, lat, lng,
    } = req.body;

    const data = {
      owner: req.user._id,
      title, description, price, txnType, propertyType,
      city, locality, address, area, areaUnit, bedrooms, bathrooms,
    };

    // coordinates are [lng, lat]
    if (lat && lng) {
      data.location = { type: "Point", coordinates: [Number(lng), Number(lat)] };
    }

    const listing = await Listing.create(data);

    // upload files, the first image becomes the cover
    const files = req.files || [];
    let coverSet = false;
    for (let i = 0; i < files.length; i++) {
      const result = await uploadToCloudinary(files[i]);
      const isCover = result.type === "image" && !coverSet;
      if (isCover) coverSet = true;
      await Media.create({
        listing: listing._id,
        type: result.type,
        url: result.url,
        publicId: result.publicId,
        isCover,
        sortOrder: i,
      });
    }

    const media = await Media.find({ listing: listing._id }).sort("sortOrder");
    res.status(201).json({
      message: "Listing created. It will be visible after admin approval.",
      listing,
      media,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// GET /api/listings/my
export const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id }).sort("-createdAt");

    // attach the media of each listing
    const result = await Promise.all(
      listings.map(async (l) => {
        const media = await Media.find({ listing: l._id }).sort("sortOrder");
        return { ...l.toObject(), media };
      })
    );

    res.json({ listings: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/listings/:id (form-data, new files in "media")
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your listing" });
    }

    const files = req.files || [];
    const oldCount = await Media.countDocuments({ listing: listing._id });
    if (oldCount + files.length > 10) {
      return res.status(400).json({ message: "A listing can have 10 files at most" });
    }

    const fields = [
      "title", "description", "price", "txnType", "propertyType", "city",
      "locality", "address", "area", "areaUnit", "bedrooms", "bathrooms",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) listing[f] = req.body[f];
    });

    const { lat, lng } = req.body;
    if (lat && lng) {
      listing.location = { type: "Point", coordinates: [Number(lng), Number(lat)] };
    }

    await listing.save();

    // add the new files, the first image becomes cover only if there is no cover yet
    let hasCover = await Media.exists({ listing: listing._id, isCover: true });
    for (let i = 0; i < files.length; i++) {
      const result = await uploadToCloudinary(files[i]);
      const isCover = result.type === "image" && !hasCover;
      if (isCover) hasCover = true;
      await Media.create({
        listing: listing._id,
        type: result.type,
        url: result.url,
        publicId: result.publicId,
        isCover,
        sortOrder: oldCount + i,
      });
    }

    const media = await Media.find({ listing: listing._id }).sort("sortOrder");
    res.json({ message: "Listing updated", listing, media });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};
// DELETE /api/listings/:id/media/:mediaId
export const deleteMedia = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your listing" });
    }

    const media = await Media.findOne({ _id: req.params.mediaId, listing: listing._id });
    if (!media) {
      return res.status(404).json({ message: "File not found" });
    }

    if (media.publicId) {
      await cloudinary.uploader.destroy(media.publicId, { resource_type: media.type });
    }
    await media.deleteOne();

    // if the cover was deleted, make the next image the cover
    if (media.isCover) {
      const next = await Media.findOne({ listing: listing._id, type: "image" }).sort("sortOrder");
      if (next) {
        next.isCover = true;
        await next.save();
      }
    }

    res.json({ message: "File deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/listings/:id/media/:mediaId/cover
export const setCover = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your listing" });
    }

    const media = await Media.findOne({ _id: req.params.mediaId, listing: listing._id });
    if (!media) {
      return res.status(404).json({ message: "File not found" });
    }
    if (media.type !== "image") {
      return res.status(400).json({ message: "Only an image can be the cover" });
    }

    await Media.updateMany({ listing: listing._id }, { isCover: false });
    media.isCover = true;
    await media.save();

    res.json({ message: "Cover image updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/listings/:id
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your listing" });
    }

    // remove files from Cloudinary, then from the database
    const media = await Media.find({ listing: listing._id });
    for (const m of media) {
      if (m.publicId) {
        await cloudinary.uploader.destroy(m.publicId, { resource_type: m.type });
      }
    }
    await Media.deleteMany({ listing: listing._id });
    await listing.deleteOne();

    res.json({ message: "Listing deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/listings/:id/status (owner: inactive, sold, rented, active)
export const changeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive", "sold", "rented"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your listing" });
    }

    // pending and rejected listings are controlled by the admin only
    if (listing.status === "pending" || listing.status === "rejected") {
      return res
        .status(400)
        .json({ message: `A ${listing.status} listing can't be changed by you` });
    }

    listing.status = status;
    await listing.save();
    res.json({ message: `Listing marked as ${status}`, listing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// makes user text safe to use inside a search pattern
const escapeText = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/listings (public, only active listings)
// filters: q, txnType, propertyType, city, locality, minPrice, maxPrice,
//          minArea, maxArea, bedrooms, sort, page, limit
export const getListings = async (req, res) => {
  try {
    const {
      q, txnType, propertyType, city, locality,
      minPrice, maxPrice, minArea, maxArea, bedrooms,
      sort, page = 1, limit = 12,
    } = req.query;

    const filter = { status: "active" };

    if (txnType) filter.txnType = txnType;
    if (propertyType) filter.propertyType = propertyType;
    if (city) filter.city = new RegExp(escapeText(city), "i");
    if (locality) filter.locality = new RegExp(escapeText(locality), "i");

    // free text search in title, city and locality
    if (q) {
      const pattern = new RegExp(escapeText(q), "i");
      filter.$or = [{ title: pattern }, { city: pattern }, { locality: pattern }];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minArea || maxArea) {
      filter.area = {};
      if (minArea) filter.area.$gte = Number(minArea);
      if (maxArea) filter.area.$lte = Number(maxArea);
    }
    if (bedrooms) filter.bedrooms = { $gte: Number(bedrooms) };

    let sortBy = "-createdAt";
    if (sort === "price_asc") sortBy = "price";
    if (sort === "price_desc") sortBy = "-price";

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Math.max(Number(limit), 1), 50);

    const total = await Listing.countDocuments(filter);
    const listings = await Listing.find(filter)
      .sort(sortBy)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // attach the cover image of each listing
    const result = await Promise.all(
      listings.map(async (l) => {
        const cover = await Media.findOne({ listing: l._id, type: "image" }).sort({
          isCover: -1,
          sortOrder: 1,
        });
        return { ...l.toObject(), cover: cover ? cover.url : null };
      })
    );

    res.json({
      listings: result,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/listings/:id (public, only active listings, counts a view)
export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.id, status: "active" },
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate("owner", "name avatarUrl createdAt");

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const media = await Media.find({ listing: listing._id }).sort("sortOrder");
    res.json({ listing, media });
  } catch (error) {
    // a badly formed id
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.status(500).json({ message: error.message });
  }
};
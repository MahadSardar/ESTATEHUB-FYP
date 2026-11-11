import express from "express";
import {
  createListing,
  getMyListings,
  updateListing,
  deleteListing,
  changeStatus,
  deleteMedia,
  setCover,
  getListingById,
} from "../controllers/listingController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/my", protect, getMyListings);


router.get("/:id", getListingById);

// logged in
router.post("/", protect, upload.array("media", 10), createListing);
router.put("/:id", protect, upload.array("media", 10), updateListing);
router.delete("/:id", protect, deleteListing);
router.patch("/:id/status", protect, changeStatus);
router.delete("/:id/media/:mediaId", protect, deleteMedia);
router.patch("/:id/media/:mediaId/cover", protect, setCover);

export default router;
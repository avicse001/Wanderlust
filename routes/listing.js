const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const listingController = require("../controllers/listings");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const Listing = require("../models/listing"); // ✅ Missing import added

const upload = multer({ storage });

// Search route (must be before /:id)
router.get("/search", async (req, res) => {
    try {
        const query = req.query.q || "";
        const allListings = await Listing.find({
            title: { $regex: query, $options: "i" }
        });
        res.render("listings/index", { allListings, query });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// All listings
router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("imageFile"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

// New listing
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Single listing
router.route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("imageFile"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// Edit form
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));


module.exports = router;

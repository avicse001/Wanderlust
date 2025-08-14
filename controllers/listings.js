const Listing = require("../models/listing");
const mongoose = require("mongoose");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid Listing ID");
        return res.redirect("/listings");
    }
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    res.render("listings/show", { listing });
};

module.exports.createListing = async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // ✅ Save Cloudinary URL & filename
    if (req.file) {
        newListing.image = req.file.path; // Cloudinary URL
    }

    await newListing.save();
    req.flash("success", "🎉 New listing created successfully!");
    res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    res.render("listings/edit", { listing });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    // ✅ Replace image if new file uploaded
    if (req.file) {
        listing.image = req.file.path;
    } else if (req.body.listing.image) {
        listing.image = req.body.listing.image;
    }

    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;

    await listing.save();
    req.flash("success", "✅ Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "🗑️ Listing deleted successfully!");
    res.redirect("/listings");
};

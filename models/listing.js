const mongoose = require("mongoose");
const { Schema } = mongoose;
const Review = require("./review"); // import Review model

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1530631673369-bc20fdb32288?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set: (v) =>
            v === ""
                ? "https://images.unsplash.com/photo-1530631673369-bc20fdb32288?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                : v,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

// ✅ Mongoose middleware to delete associated reviews
listingSchema.pre("findOneAndDelete", async function (next) {
    const listing = await this.model.findOne(this.getFilter());
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
    next();
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

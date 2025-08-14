// Load environment variables
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");

// Route imports
const listingRoutes = require("./routes/listing");
const reviewRoutes = require("./routes/review");
const userRoutes = require("./routes/user");


const dbUrl = process.env.ATLASDB_URL;

main()
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.log("❌ MongoDB connection error:", err));


async function main() {
    await mongoose.connect(dbUrl);
}

// View engine setup
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // local uploads if needed
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/boilerplate");

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SESSION_SECRET || "ThisShouldBeASecret",
    },
    touchAfter: 24 * 60 * 60, // 1 day
});

store.on("error", () => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

// Session and flash config
const sessionOptions = {
    store,
    secret: process.env.SESSION_SECRET || "ThisShouldBeASecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    }
};




app.use(session(sessionOptions));
app.use(flash());

// Passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash & current user middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// Demo user route
app.get("/demouser", async (req, res) => {
    try {
        const fakeUser = new User({
            email: "student@example.com",
            username: "delta-student",
        });
        const registeredUser = await User.register(fakeUser, "helloworld");
        res.send(registeredUser);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Root route
app.get("/", (req, res) => {
    res.redirect("/listings");
});


// Use Routes
app.use("/", userRoutes);
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);

// Global error handler (Improved)
app.use((err, req, res, next) => {
    console.error("❌ Error details:", err);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong!";

    req.flash("error", message);
    res.status(statusCode).redirect("back");
});

// Server start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

const User = require("../models/user");

module.exports.renderRegisterForm = (req, res) => {
    res.render("users/register");
};

module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/register");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect(res.locals.redirectUrl || "/listings");
};

module.exports.logout = (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash("success", "Logged out successfully");
        res.redirect("/listings");
    });
};
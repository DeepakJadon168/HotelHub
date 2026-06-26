const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password, phone, role, gender, organization } = req.body;

        // Creating custom user instance with all extended fields
        const user = new User({ email, username, phone, role, gender, organization });

        User.register(user, password, (err, registeredUser) => {
            if (err) {
                console.log("REGISTER ERROR:", err);
                req.flash("error", err.message);
                return res.redirect("/signup");
            }

            req.login(registeredUser, (err) => {
                if (err) return next(err);

                req.flash("success", `Welcome to PG Wallah, ${username}!`);
                return res.redirect("/listings");
            });
        });

    } catch (err) {
        next(err);
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to PG Wallah!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/listings');
        }
        req.flash("success", "You are logged out successfully");
        res.redirect("/listings");
    });
};
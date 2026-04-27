const User= require("../models/user");

module.exports.renderSignupForm=(req,res)=>{
    res.render("users/signup.ejs");
}

// module.exports.signup= async(req,res,next)=>{
//        try {
//             let { username,email,password }= req.body;
//             console.log('Signup attempt:', { username, email });

//             const newUser= new User({ email, username});

//             User.register(newUser, password, (err, registedUser)=>{
//                 if(err){
//                     console.error('User.register error:', err);
//                     req.flash("error", err.message);
//                     return res.redirect('/signup');
//                 }
//                 console.log('User registered:', registedUser);

//                 req.login(registedUser,(loginErr)=>{
//                     if(loginErr){
//                         console.error('Login error:', loginErr);
//                         req.flash("error", loginErr.message);
//                         return res.redirect('/signup');
//                     }
//                     console.log('User logged in successfully');
//                     req.flash("success","welcome to wanderlust");
//                     res.redirect("/listings");
//                 });
//             });
      
//     }catch(e){
//         console.error('Signup error:', e.message, e);
//         next(e);
//         req.flash("error",e.message);
//         res.redirect("/signup");
//     }
// }

module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const user = new User({ email, username });

        User.register(user, password, (err, registeredUser) => {
            if (err) {
                console.log("REGISTER ERROR:", err);
                req.flash("error", err.message);
                return res.redirect("/signup");
            }

            req.login(registeredUser, (err) => {
                if (err) return next(err);

                req.flash("success", "Welcome to Wanderlust");
                return res.redirect("/listings");
            });
        });

    } catch (err) {
        next(err);
    }
};


// module.exports.signup = async (req, res) => {
//     try {
//         const { username, email, password } = req.body;

//         const newUser = new User({ email, username });

//         const registeredUser = await User.register(newUser, password);

//         req.login(registeredUser, (err) => {
//             if (err) {
//                 req.flash("error", err.message);
//                 return res.redirect("/signup");
//             }

//             req.flash("success", "Welcome to Wanderlust");
//             res.redirect("/listings");
//         });

//     } catch (err) {
//         req.flash("error", err.message);
//         res.redirect("/signup");
//     }
// };







module.exports.renderLoginForm= (req,res)=>{
            req.flash("success","welcome back to wanderlust");
            res.render("users/login.ejs");
}

module.exports.login= async(req,res)=>{
            req.flash("success","welcome back to wanderlust");
            let redirectUrl= res.locals.redirectUrl || "/listings";
            res.redirect(redirectUrl);
        }

module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            req.flash('error', err.message);
            return res.redirect('/listings');
        }
        req.flash("success","you are logged out");
        let redirectUrl= res.locals.redirectUrl || "/listings";
        res.redirect("/listings");
    }

)};
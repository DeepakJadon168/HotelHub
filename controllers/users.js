const User= require("../models/user");

module.exports.renderSignupForm=(req,res)=>{
    res.render("users/signup.ejs");
}

module.exports.signup= async(req,res,next)=>{
       try {
            let { username,email,password }= req.body;
            console.log('Signup attempt:', { username, email });
            const newUser= new User({ email, username});
            User.register(newUser, password, (err, registedUser)=>{
                if(err){
                    console.error('User.register error:', err);
                    req.flash("error", err.message);
                    return res.redirect('/signup');
                }
                console.log('User registered:', registedUser);
                req.login(registedUser,(loginErr)=>{
                    if(loginErr){
                        console.error('Login error:', loginErr);
                        req.flash("error", loginErr.message);
                        return res.redirect('/signup');
                    }
                    console.log('User logged in successfully');
                    req.flash("success","welcome to wanderlust");
                    res.redirect("/listings");
                });
            });
      
    }catch(e){
        console.error('Signup error:', e.message, e);
        next(e);
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}

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
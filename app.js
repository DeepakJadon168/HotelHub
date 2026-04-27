if(process.env.NODE_ENV !="production"){
    require('dotenv').config();
}

console.log(process.env.SECRET);

const express= require("express");
const app= express();
const mongoose= require("mongoose");

const path= require("path");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");
const ExpressError= require("./utils/ExpressError.js");
const wrapAsync= require("./utils/wrapAsync.js");
const session = require("express-session");
const MongoStore = require('connect-mongo').default;
const flash= require("connect-flash");
const passport= require("passport");
const LocalStrategy= require("passport-local"); 
const User= require("./models/user");

const listingRouter= require("./routes/listing.js");
const reviewRouter= require("./routes/review.js");
const userRouter= require("./routes/user")
//connect the wanderlust databse

// in app.js
const dbUrl = process.env.ATLASDB_URL || 'mongodb://127.0.0.1:27017/wanderlustclg';

async function main(){
    await mongoose.connect(dbUrl, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 60000,
        connectTimeoutMS: 30000,
        maxPoolSize: 15,
        minPoolSize: 10,
        retryWrites: true,
        retryReads: true,
        maxStalenessSeconds: 120,
        family: 4
    });
    console.log("connected to db");
}

main().catch((err) =>{
    console.log(err);
});

app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err)=>{
    console.log("Error in MONGO SESSION STORE",err);
})

const sessionOptions={
    store,
    secret: process.env.SECRET ,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now()+ 7 * 24 * 60 *60* 1000,
        maxAge: 7* 24 *60* 60 * 1000,
        httpOnly: true
    }
};
const port = process.env.PORT || 8080;


//Create the first api
// app.get("/",(req,res)=>{
//     res.send("Hi, i am root");
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ensure currUser is always defined for templates
app.locals.currUser = null;
app.use((req,res,next)=>{
    res.locals.success= req.flash("success");
    res.locals.error= req.flash("error");
    res.locals.currUser= req.user || null;
    next();
})

// Check database connection status
app.use((req,res,next)=>{
    const readyState = mongoose.connection.readyState;
    if(readyState === 0 || readyState === 3) { // 0=disconnected, 3=disconnecting
        return res.status(503).render("error.ejs", {
            message: "Database is currently unavailable. Please try again in a moment.",
            statusCode: 503
        });
    }
    next();
})

// Mongoose connection event logging to help diagnose buffering/disconnects
const db = mongoose.connection;
db.on('connected', () => {
    console.log('Mongoose: connected to MongoDB');
});
db.on('disconnected', () => {
    console.warn('Mongoose: disconnected from MongoDB');
});
db.on('reconnectFailed', (err) => {
    console.error('Mongoose: reconnect failed', err);
});
db.on('error', (err) => {
    console.error('Mongoose: connection error', err);
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser= new User({
//         email:"deepak@gmail.com",
//         username:"Deepak"
//     });
//     let registeredUser= await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// })

app.get("/", (req, res) => {
    res.redirect("/listings");
});
app.use("/listings", listingRouter);

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);



// app.use((req,res,next)=>{
//     next(new ExpressError(404,"page not found"));
// })

app.use((req, res, next) => {
  next(new ExpressError(404,"Page Not Found"));
});


app.use((err,req,res,next)=>{
    console.error('Express error handler caught:', err);
    if (err && err.stack) console.error(err.stack);
    let {statusCode =500, message ="something went wrong"}= err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
});

// Start the server
app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
});
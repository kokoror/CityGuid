// this version implementes routes 

//access enviroment varible //we created .env file and set env varible there
if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
//you can see the value printed out in the concole by running below
// console.log(process.env.SECRET)

const express = require('express');
const app = express();
const path = require('path'); // import path 
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');  // one of the engines to be used ********
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
// const Joi = require('joi');//data validator for JavaScript. for validation on adding data in database
const ExpressError = require('./utils/ExpressError')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');//for security check express-mongon-sanitize for details
//Object keys starting with a $ or containing a . are reserved for use by MongoDB as operators. Without this sanitization, 
//malicious users could send an object containing a $ operator, or including a ., which could change the context of a database operation. 
//Most notorious is the $where operator, which can execute arbitrary JavaScript on the database.
//The best way to prevent this is to sanitize the received data, and remove any offending keys, or replace the characters with a 'safe' one.
const helmet = require('helmet'); //Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!

const MongoStore = require("connect-mongo"); // connect session to mongodb

//import routes
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const dbUrl = process.env.DB_URL; // database address used for production
// const dbUrl ='mongodb://localhost:27017/yelp-camp'; 
//connect to mongodb
//'mongodb://localhost:27017/yelp-camp' // db address used for development
mongoose.connect(dbUrl, { 
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
    // useFindAndModify: false // this if for the deprecation msg to go away
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connnection error:"));
db.once("open",() => {
    console.log("Database connected");
})

//set view engines and give views a root path so you can render the files in views folder without needing to have explicit path
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'))

app.engine('ejs',ejsMate) //this engine is used based on ejs ********* us used for formating the ejs file <%- body %> in boilerplate and <% layout('layouts/boilerplate') %> in all the pages
//app.use() runs the content in () for each route request
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
//set public as static directory. generally used for saving images audios, 
//scripts, styles etc, used in the view to include js from public directory
//The root parameter describes the root directory from which to serve static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());//for security


const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 //don't want to resave all the session on database every single time that the user refresh the page, you can lazy update the session, by limiting a period of time.
})

//check for errors
store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        // an extra security setting httpOnly
        httpOnly: true,
        // secure: true,
        // set it to expired from one week from now
        expires: Date.now + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

//use helmet for security//set restriction on loading sources
app.use(helmet());

const scriptSrcUrls = [
    "https://cdn.jsdelivr.net/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dhqsmhiir/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://upload.wikimedia.org/wikipedia/commons/thumb/" ,
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


//refer to doc (Middleware and session support)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// the below is to do with how info is stored in the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// include a middleware for flash before routes
//so this will be executed before every single request
// does this create a local varible?? cuz we dont need to pass the varible to views
app.use((req, res, next) => {
    // you can print out session to see what is going on
    // console.log(req.session);
    
    //check after using mongo sanitize
    // console.log(req.query);

    // req.user comes with Passport, is used to check is user is logged in
    //we save it to local so we can use the currenUser in the ejs to check if user is there
    res.locals.currentUser = req.user;
    
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//app user routes // test for creating a user, the passport package hashes the password behind the scene.
// app.get('/fakeUser', async (req, res) => {
//     const user = new User({email:'username@gmail.com', username: 'username'});
//     const newUser = await User.register(user, 'password');
//     res.send(newUser);              
// });


// use campgrounds route here, set routers' prefix 
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

//belows are routes
app.get('/', (req, res) => {
    res.render('home')
})


//create error handler

//this only runs when nothing is match above
//you can also use app.get here
app.all('*', (req, res, next) => {
    // res.send("404!!!")//instead sending the message you throw a error using you defined ExpressError class in utils folder!,
    next(new ExpressError('Page Not Found', 404)) // in () is the error you pass along to the below handler
})


app.use((err, req, res, next) => {
    // res.send("oh, something went wrong!")
    //err now takes any errors that are passed along 
    const {statusCode = 500, message = 'Something Went Wrong'} = err; //set default statusCode and message if err doesnt not have these properties
    // res.status(statusCode).send(message)
    console.log(err)
    res.status(statusCode).render('error', {err, statusCode, message}) //created an error.ejs to render a error page
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`server has started on port ${port}`)
})
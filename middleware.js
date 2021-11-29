const {campgroundSchema, reviewSchema} = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

// set a middleware to check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    //store the url the user is requesting
    // console.log(req.path, req.originalUrl)
    // save the url in the session
    req.session.returnTo = req.originalUrl

    //note the req.isAuthenticated() comes with Passport, its a built in method
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in.');
        return res.redirect('/login'); // remember to return this, otherwise the code still runs
    }
    next();
}


// Joi middleware for validating server side data
module.exports.validateCampround = (req, res, next) => {
    // recommended to put the campgroundSchema in a seperate file called schemas.js and then import to use here
        // const campgroundSchema = Joi.object({
        //     campground: Joi.object({ //note in req.body everything comes in campground[..] format//refer to new.ejs
        //         title: Joi.string().required(),
        //         image: Joi.string().required(),
        //         price: Joi.number().required().min(0),
        //         description: Joi.string().required(),
        //         location: Joi.string().required()
        //     }).required()
        // })

        // we shifted the above code in to the file called schemas.js file and we have imported the schema from schemas.js
        const result = campgroundSchema.validate(req.body) 
        
        //experiment
        // const result = campgroundSchema.validate({campground:{title: 'test', image:'test',price:22, description:'test',location: 11 }})
        // console.log(result) 

        if (result.error) {
            // console.log(result.error.details) // if you are not sure about the structure, print it out
            //array.map(element => element.message) // array.join() convert array to string
            
            // console.log(result.error.details.map(el => el.message))
            const msg = result.error.details.map(el => el.message).join(',')
            console.log(msg)
            throw new ExpressError(msg, 400) // the error thrown will be caught by try catch block
        } // if no error, call next()
        next()
        
}

// add a protection middleware here to stop non-author trying to send a put/delete campground
module.exports.isAuthor = async(req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// add a protection middleware here to stop non-author trying to send a delete review request
module.exports.isReviewAuthor = async(req, res, next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

//middleware to validate review
module.exports.validateReview = (req, res, next) => {
    const result = reviewSchema.validate(req.body)
    // console.log(result)
    if(result.error){
        const msg = result.error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    next()
}
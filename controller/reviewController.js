const Campground = require('../models/campground'); //get db model
const Review = require('../models/review'); //get review model

module.exports.createReview = async (req, res, next) => {
    try{
        const {id} =req.params;
        const review = new Review(req.body.review);
        //*****set author to be current loggedin user */
        review.author = req.user._id;
        const campground = await Campground.findById(id);
        campground.reviews.push(review);
        await review.save();
        await campground.save();
        req.flash('success', 'Successfully crated a new review!');
        res.redirect(`/campgrounds/${id}`)
    } catch(e) {
        next(e)
    }

}


module.exports.deleteReview = async(req, res, next) => {
    try {
        const {id, reviewId} = req.params;
        //the below is to delete the review object id from the camgrounds reviews array 
        await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
        //delete the review from reviews collections
        await Review.findByIdAndDelete(reviewId);
        req.flash('success', 'Successfully deleted the review!');
        res.redirect(`/campgrounds/${id}`)

    } catch(e) {
        next(e)
    }

}
const express = require('express');
const router = express.Router({mergeParams: true}); 
// add {mergeParams: true} as the router keeps them seperate, 
//now we want access to the review under the same id of campground so we need setmergeParam to true
const {isLoggedIn, isReviewAuthor, validateReview} = require('../middleware');
const reviewController = require('../controller/reviewController');

const Campground = require('../models/campground'); //get db model
const Review = require('../models/review'); //get review model



// post a review
router.post('/', isLoggedIn, validateReview, reviewController.createReview)

//delete a review and also delete the review object id in the camground reviews array.
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, reviewController.deleteReview)

module.exports = router;
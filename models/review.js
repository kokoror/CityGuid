//this section creates database Schema and export model review to be used in index.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create schema
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

//export model Campground
module.exports = mongoose.model('Review', reviewSchema);
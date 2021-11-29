//this section creates database Schema and export model Campground to be used in index.js
const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

//create schema

//seperate imageschema out so we can add virtual property (thumbnail to used in the edit.ejs)
const ImageSchema = new Schema({
    url: String,
    filename: String 
})

//this virtual property is not stored in the databased, 
//when we call imgages.thumbnail it calls the function
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200')
})

// by defaultm mongoose does not include virtuals when you convert a document to JSON.
//To include virtuals , you need to set the toJSON schema option to {virtuals: true}, and add it at the end when 
//create schema (line 53)
const opts = {toJSON: {virtuals: true}};


const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: { //FOR MAP
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author:{
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

//this virtual property is not stored in the databased, 
//when we call it calls the function
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,50)}...</p>`;
})

// when a campground is deleted, all its reviews should be deleted too
//this is done by using mongoose middleware, check mongoose doc for what middlewares 
//the findByIdandDelete triggers
CampgroundSchema.post('findOneAndDelete', async function(campground) {
    // console.log('deleted')//check if this middleware if triggered
    //console.log(campground) print deleted campground

    //if campground exists, delete the reviews records whose id is in the campground reviews
    if(campground){
        await Review.deleteMany({
            _id:{$in: campground.reviews}
        })
    }

})

//export model Campground
module.exports = mongoose.model('Campground', CampgroundSchema)
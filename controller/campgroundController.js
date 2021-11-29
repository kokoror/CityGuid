//route handling functions

const Campground = require('../models/campground'); //get db model
const {cloudinary} = require('../cloudinary'); // we need it to delete imgs from cloudinary

//for map (maobox)
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

//when using try/catch block, remember to add next parameter!!
module.exports.index =  async (req, res, next) => { 
    try{
        const campgrounds = await Campground.find({})
        res.render('campgrounds/index', {campgrounds})
    } catch (e) {
        next(e)
    }
}

module.exports.renderNewForm = (req, res) => {  
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    try{
        // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400); 
        // the above line won't gets excuted from the website cuz the client side validation prevents an empty inputs from user for campground, however, this can protect eg. empty request from postman request.
        
        //below uses joi to validata data before saving to database//refer to joi documentation
        //because we want the server side validation for all route requests, so we build a middleware instead of writing the validatio code here

        // const campgroundSchema = Joi.object({
        //     campground: Joi.object({ //note in req.body everything comes in campground[..] format//refer to new.ejs
        //         title: Joi.string().required(),
        //         image: Joi.string().required,
        //         price: Joi.number().required().min(0),
        //         description: Joi.string().required(),
        //         location: Joi.string().required()
        //     }).required()
        // })
        // const result = campgroundSchema.validate({title: 'test', image:'test',price:22, description:'test',location: 11 })
        // console.log(result)

        ////////////
        //returns an array of imgs' [{path:..., filename:...}, {path:..., filename:...}]
        
        //forward geocode for map, according to doc forward geocode (convert location to coordinates)
        const geoData = await geocoder.forwardGeocode({
            query: req.body.campground.location,
            limit: 1
        }).send()
        //console.log(geoData.body.features[0].geometry.coordinates);
        // save geoData.body.features[0].geometry in db
        
        //
        const newCampground = new Campground(req.body.campground);
        newCampground.geometry = geoData.body.features[0].geometry; 
        newCampground.images = req.files.map(f => ({url: f.path, filename: f.filename}))
        newCampground.author = req.user._id;
        await newCampground.save();
        // console.log(newCampground);
        //add flash
        req.flash('success', 'Successfully made a new campground.')
        res.redirect(`/campgrounds/${newCampground._id}`)
    } catch (e) {
        next(e)
    }
}

module.exports.showCampground = async (req, res, next) => {
    try{
        const {id} = req.params;
        //nested populate cuz we need the author for each of the reviews
        const campground = await Campground.findById(id)
            .populate({
                path: 'reviews',
                populate: {
                    path: 'author'
                }
            }).populate('author');

        console.log(campground)
        // if cant find the campground (eg, just deleted), flash a error msg
        if(!campground) {
            req.flash('error', 'Cannot find that campground');
            // this is going through the middleware before going to the page /campgrounds
            res.redirect('/campgrounds')
        }
        res.render('campgrounds/show', {campground})
    } catch (e) {
        next(e)
    }
}


module.exports.renderEditForm = async (req, res, next) => {
    try{
        const {id} = req.params;
        const campground = await Campground.findById(id);

        // if cant find the campground (eg, just deleted), flash a error msg
        if(!campground) {
            req.flash('error', 'Cannot find that campground');
            return res.redirect('/campgrounds')
        }
        res.render('campgrounds/edit', {campground}) 
    } catch (e) {
        next(e)
    }
}

module.exports.updateCampground = async (req, res, next) => {
    try{
        const {id} = req.params;   
        const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
        ////update images - similar to add new campground
        const imgs = req.files.map(f => ({url: f.path, filename: f.filename}))
        campground.images.push(...imgs);
        await campground.save();
        //delete images that are selected // pull from images whose filename is in that array
        if (req.body.deleteImages) {
            //delete imgs from cloudinary with filename
            for (let filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename)
            }
            //delete imgs from database
            await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});  
        }
        // console.log(campground);
        ////
        req.flash('success', 'Successfully updated the campground');
        res.redirect(`/campgrounds/${id}`)
    } catch (e) {
        next(e)
    }
}


module.exports.deleteCampground = async (req, res, next) => {
    try{
        const {id} = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash('success', 'Successfully deleted the campground.')
        res.redirect('/campgrounds')
    } catch (e) {
        next(e)
    }
}
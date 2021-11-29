// command + d to select same variables
// this file sets routes for campgrounds
const express = require('express');
const router = express.Router();
const {isLoggedIn, isAuthor, validateCampround} = require('../middleware');
const campgroundController = require('../controller/campgroundController');
const multer = require('multer') // for img updload
// const upload = multer({dest: 'uploads/'}) //use upload middleware to save img to local folder uploads/
const {storage} = require('../cloudinary');
const upload = multer({storage})

const Campground = require('../models/campground'); //get db model


//*********/
// below is an alternate way to organize routes (group the same path with different requests)

// router.route('/')
//       .get(campgroundController.index)
//       .post(isLoggedIn, validateCampround, campgroundController.createCampground)

//below is a class way for routes

//when using try/catch block, remember to add next parameter!!
router.get('/', campgroundController.index)

// this route goes before the '/campgrounds/:id' otherwise the route would treat new as an id 
router.get('/new', isLoggedIn, campgroundController.renderNewForm)

//added validation middleware validateCampground
router.post('/', isLoggedIn, upload.array('image'), validateCampround, campgroundController.createCampground)

// demo: img upload middleware - upload.single('name') or upload.array('name')
// router.post('/', upload.array('image'), (req, res) => {
//     console.log(req.body);
//     console.log(req.files);
//     res.send("it worked");
// })

router.get('/:id', campgroundController.showCampground)

router.get('/:id/edit', isLoggedIn, isAuthor, campgroundController.renderEditForm)

router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampround, campgroundController.updateCampground)

router.delete('/:id', isLoggedIn, isAuthor, campgroundController.deleteCampground)

module.exports = router;
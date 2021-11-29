const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controller/userController')
const User = require('../models/user');

router.get('/register', userController.renderRegister)

router.post('/register', userController.register)

router.get('/login', userController.renderLogin)

// the passport.authenticate works as a middleware here using a local strategy 
// if user enters a valid username and password it will login
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect:'/login'}), userController.login)

router.get('/logout', userController.logout)

module.exports = router;
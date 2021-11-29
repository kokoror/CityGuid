const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    try {
        const {email, username, password} = req.body;
        const user = new User({email, username});
        // passport package hashes the password behind the scene
        // refer to authDemo for how hashing works using bcrypt
        const registeredUser = await User.register(user, password);

        // need to login user after user registers
        // follow Passport template
        //differnet from login we use passport.authenticate is because we cannot authenticate a user until we 
        //create one
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })   
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    
    // return to where user is making request before asked for login
    const redirectUrl = req.session.returnTo || '/campgrounds';
    // delete it after reading it to variable
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout =(req, res) => {
    // req.logout comes with passport
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
}
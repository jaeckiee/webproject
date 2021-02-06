import express from "express";
var router = express.Router();
import passport from "../config/passport.js";

// Home
router.get('/', function(req, res) {
    res.render('home/welcome');
});
router.get('/about', function(req, res) {
    res.render('home/about');
});

// Login
router.get('/login', function(req, res) {
	var username = req.flash('username')[0];
	var errors = req.flash('errors')[0] || {};
	res.render('home/login', {
		username: username,
		errors: errors
	})
})

// Post Login
router.post('/login',
	function(req, res, next) {
		var errors= {};
		var isValid = true;

		if (!req.body.username) {
			isValid = false;
			errors.username = 'Username is required!';
		}
		if (!req.body.password) {
			isValid = false;
			errors.password = 'Password is required!';
		}

		if (isValid) next();
		else {
			req.flash('errors', errors);
			res.redirect('/login');
		}
	},
	passport.authenticate('local-login', {
		successRedirect : '/posts',
		failureRedirect : '/login'
	})
);

// Logout
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/login/naver', passport.authenticate('naver-login',null),(req,res) => {
	console.log("naver login");	
});

router.get('/login/naver/callback', passport.authenticate('naver-login',{
	successRedirect: '/',
	failureRedirect: '/users/new',
	failureFlash : true
}));




module.exports = router;
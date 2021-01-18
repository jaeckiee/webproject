import express from "express";
var router = express.Router();
import User from "../models/User.js";
import util from "../util.js";

// Index - index는 숨겨둠
router.get('/', function(req, res) {
    User.find({})
        .sort({username:1})
        .exec(function(err, users) {
            if (err) return res.json(err);
            res.render('users/index', {users: users});
        });
});

// New
router.get('/new', function(req, res) {
    var user = req.flash('user')[0] || {};
    var errors = req.flash('errors')[0] || {};
    res.render('users/new', { user: user, errors: errors });
});

// Create
router.post('/', function(req, res) {
    User.create(req.body, function(err, user) {
        if (err) {
            req.flash('user', req.body);
            req.flash('errors', util.parseError(err));
            return res.redirect('/users/new');
        }77
        res.redirect('/users');
    });
});

// Show
router.get('/:username', util.isLoggedin, checkPermission, function(req, res) {
    User.findOne({username: req.params.username}, function(err, user) {
        if (err) {console.log(err);return res.json(err);}
        res.render('users/show', {user: user});
    });
});

// Edit
router.get('/:username/edit', util.isLoggedin, checkPermission, function(req, res) {
    var user = req.flash('user')[0];
    var errors = req.flash('errors')[0] || {};
    if (!user) {
        User.findOne({username: req.params.username}, function(err, user) {
            if (err) return res.json(err);
            res.render('users/edit', {username: req.params.username, user: user, errors: errors });
        });
    }
    else {
        res.render('users/edit', {username: req.params.username, user:user, errors: errors});
    }
});

// Update
router.put('/:username', util.isLoggedin, checkPermission, function(req, res, next) {
    User.findOne({username:req.params.username})
        .select('password')
        .exec(function(err, user) {
            if (err) return res.json(err);

            // Update user object
            user.originalPassword = user.password;
            user.password = req.body.newPassword? req.body.newPassword : user.password;
            for (var p in req.body) user[p] = req.body[p];

            // Save updated user
            user.save(function(err, user) {
                if (err) {
                    req.flash('user', req.body);
                    req.flash('errors', util.parseError(err));
                    return res.redirect('/users/'+req.params.username+'/edit');
                }
                res.redirect('/users/' + user.username);
            });
        });
});

// Destroy
router.delete('/:username', function(req, res) {
    User.deleteOne({username: req.params.username}, function(err) {
        if (err) return res.json(err);
        res.redirect('/users');
    });
});

module.exports = router;

// Private functions
function checkPermission(req, res, next) {
	console.log(req.params.username);
	User.findOne({username: req.params.username}, function(err, user) {
		if (err) return res.json(err);
		if (user.id != req.user.id) return util.noPermission(req, res);
		
		next();
	})
}
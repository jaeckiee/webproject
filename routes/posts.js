import express from "express";
var router = express.Router();
import Post from "../models/Post.js";
import util from "../util.js";

// Index
router.get('/', function(req, res) {
    Post.find({})
    .populate('author')	// relationship 항목의 값을 생성시켜줌
    .sort('-createdAt')
    .exec(function(err, posts) {
        if (err) return res.json(err);
        res.render('posts/index', { posts: posts });
    });
});

// New
router.get('/new', function(req, res) {
    var post = req.flash('post')[0] || {};
    var errors = req.flash('errors')[0] || {};
    res.render('posts/new', { post: post, errors: errors });
});

// Create
router.post('/', function(req, res) {
    req.body.author = req.user._id;
    Post.create(req.body, function(err, post) {
        if (err) {
            req.flash('post', req.body);
            req.flash('errors', util.parseError(err));
			// console.log("씨발 뭔데: "+err);
            return res.redirect('/posts/new');
        }
        res.redirect('/posts');
    });
});

// Show
router.get('/:id', function(req, res) {
    Post.findOne({ _id: req.params.id })
        .populate('author')
        .exec(function(err, post) {
            if (err) return res.json(err);
            res.render('posts/show', { post: post });
        });
});

// Edit
router.get('/:id/edit', function(req, res) {
    var post = req.flash('post')[0];
    var errors = req.flash('errors')[0] || {};
    if (!post) {
        Post.findOne({_id: req.params.id}, function(err, post) {
            if (err) return res.json(err);
            res.render('posts/edit', { post: post, errors: errors });
        });
    }
    else {
        post._id = req.params.id;
        res.render('posTs/edit', { post: post, errors: errors });
    }
});

// Update
router.put('/:id', function(req, res) {
    req.body.updatedAt = Date.now();
    Post.findOneAndUpdate({_id: req.params.id}, req.body, {runValidators:true}, function(err, post) {
        if (err) {
            req.flash('post', req.body);
            req.flash('errors', util.parseError(err));
            return res.redirect('/posts/'+req.params.id+'/edit');
        }
        res.redirect('/posts/'+req.params.id);
    });
});

// destroy
router.delete('/:id', function(req, res) {
	console.log("이거 들오냐??????????????????");
    Post.deleteOne({_id: req.params.id}, function(err) {
        if (err) return res.json(err);
        res.redirect('/posts');
    });
});

module.exports = router;
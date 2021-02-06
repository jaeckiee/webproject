import express from "express";
var router = express.Router();
import Post from "../models/Post.js";
import History from "../models/History.js";
import Image from "../models/Image.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js"
import util from "../util.js";
import cheerio from "cheerio";


//////////////////////////////////////////////////////////////// MAIN CRUD

// Index
router.get('/', function(req, res) {
    Post.find({})
    .populate('author')   // relationship 항목의 값을 생성시켜줌
    .sort('-createdAt')
    .exec(function(err, posts) {
        if (err) return res.json(err);
        res.render('posts/index', { posts: posts });
    });
});

// Search
router.get('/search', function(req, res) {
    Post.find({title: { $regex: new RegExp(req.query.search, 'i') }})
	.populate('author')
    .exec(function(err, posts) {
        if (err) return res.json(err);
        res.render('posts/search', { posts: posts });
    });
});

// Autocomplete
router.get('/search/autocomplete', function(req, res, next) {
    Post.find({}, 'title')
	.exec(function(err, posts) {
        if (err) return res.json(err);
		var list=[];
		for (var i in posts){
			list.push(posts[i].title);
		}
        res.json(list);
    });
});

// New
router.get('/new', util.isLoggedin, function(req, res) {
    var post = req.flash('post')[0] || {};
    var errors = req.flash('errors')[0] || {};
    res.render('posts/new', { post: post, errors: errors });
});

// Create
router.post('/', util.isLoggedin, function(req, res) {
    req.body.author = req.user._id;
	// 새 post 생성하고 얻은 id를 img태그에 붙이고, src는 Image로 따로 뺌.
    Post.create(req.body, function(err, post) {
		if (err) {
			req.flash('post', req.body);
			req.flash('errors', util.parseError(err));
			return res.redirect('/posts/new');
		}
		// 히스토리 생성.
		console.log(post.id);
		History.create({
			postId: post.id,
			editMsg: "생성: "+post.createdAt,
			title: post.title,
			body: post.body,
			author: post.author,
			createdAt: post.createdAt,
			updatedAt: post.updatedAt
		});
		// cheerio는 서버 단에서 jquery 구문을 쓸 수 있도록 해주는 모듈.
		var $ = cheerio.load(req.body.body);
		$('body').find('img').each(function(item, idx, array) {
			var src = $(this).attr('src');
			Image.create({src: $(this).attr('src'), postId: post.id, idx: item });
			$(this).attr('id', post.id+'_'+item);
			$(this).removeAttr('src');
		});
		Post.findOneAndUpdate({_id: post.id}, {$set:{body:$('body').html()}}, {runValidators:true}, function(err, post) {
			if (err) {
				req.flash('post', req.body);
				req.flash('errors', util.parseError(err));
				return res.redirect('/posts/new');
			}
		});
        res.redirect('/posts');
    });
});

// Show
router.get('/:id', function(req, res) {
	Post.findOne({_id: req.params.id})
	.populate({ path: 'author', select: 'username' })
	.exec(function(err, post) {
		if (err) return res.json(err);
		res.render('posts/show', { post:post });
	});
});

// Edit
router.get('/:id/edit', util.isLoggedin, checkPermission, function(req, res) {
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
        res.render('posts/edit', { post: post, errors: errors });
    }
});

// Update
router.put('/:id', util.isLoggedin, checkPermission, function(req, res) {
    req.body.updatedAt = Date.now();
	// 당장의 해결 : 먼저 update 한 번 하고 에러가 생기면 새로고침. 안 생기면 이미지들 뺴고 다시 update...
    Post.findOneAndUpdate({_id: req.params.id}, req.body, {runValidators:true}, function(err, post) {
		if (err) {
			req.flash('post', req.body);
			req.flash('errors', util.parseError(err));
			return res.redirect('/posts/'+req.params.id+'/edit');
		}
		// 히스토리 생성.
		var id = (req.body.postId != undefined) ? req.body.postId : req.params.id;
		var editMsg = req.body.editMsg;
		if (editMsg == "") editMsg = "편집: "+ post.updatedAt;
		History.create({
			postId: id,
			editMsg: editMsg,
			title: req.body.title,
			body: req.body.body,
			author: post.author,
			createdAt: post.createdAt,
			updatedAt: req.body.updatedAt
		}, function() {
			Image.deleteMany({postId: req.params.id}, function(err) {
				if (err) return res.json(err);
			});
			var $ = cheerio.load(req.body.body);
			$('body').find('img').each(function(item, idx, array) {
				var src = $(this).attr('src');
				Image.create({src: $(this).attr('src'), postId: post.id, idx: item });
				$(this).attr('id', post.id+'_'+item);
				$(this).removeAttr('src');
			});
			Post.findOneAndUpdate({_id: post.id}, {$set:{body:$('body').html()}}, {runValidators:true}, function(err, post) {
				if (err) {
					req.flash('post', req.body);
					req.flash('errors', util.parseError(err));
					return res.redirect('/posts/'+req.params.id+'/edit');
				}
			});
			res.redirect('/posts/'+req.params.id);
		});
	});
});

// Destroy
router.delete('/:id', util.isLoggedin, checkPermission, function(req, res) {
	Image.deleteMany({postId: req.params.id}, function(err) {
		if (err) return res.json(err);
	});
	History.deleteMany({postId: req.params.id}, function(err) {
		if (err) return res.json(err);
	})
    Post.deleteOne({_id: req.params.id}, function(err) {
		if (err) return res.json(err);
		res.redirect('/posts');
    });
});


//////////////////////////////////////////////////////////////// SHOW IMAGES

// Image Rendering
router.get('/imgs/:id', function(req, res) {
	Image.find({postId: req.params.id}, function(err, imgs) {
		if (err) return res.json(err);
		res.json(imgs);
	})
});


//////////////////////////////////////////////////////////////// COMMENT

// comment create
router.post('/:id/comment',util.isLoggedin, checkPostId, function(req, res){ // 1
  var post = res.locals.post; // 1-1
  req.body.author = req.user._id; // 2
  req.body.authorname=req.user.name;
  req.body.post = req.params.id;// 2
  Comment.create(req.body, function(err, post){
    if(err) return res.json(err);
    return res.redirect('/posts/'+req.params.id+res.locals.getPostQueryString()+'/comment')
  });
});

// comment index
router.get('/:id/comment', function(req, res){ 
  var commentForm = req.flash('commentForm')[0] || {_id: null, form: {}};
  var commentError = req.flash('commentError')[0] || { _id:null, parentComment: null, errors:{}};
  Promise.all([
      Post.findOne({_id:req.params.id}).populate({ path: 'author', select: 'username' }),
      Comment.find({post:req.params.id}).sort('createdAt').populate({ path: 'author', select: 'username' })
    ])
    .then(([post, comments]) => {
      res.render('posts/comment', { post:post, comments:comments, commentForm:commentForm, commentError:commentError});
    })
    .catch((err) => {
      console.log('err: ', err);
      return res.json(err);
    });
});

// comment destroy
router.delete('/:id/comment', util.isLoggedin, checkPermission2, checkPostId, function(req, res){
  var post = res.locals.post;
  var post_Id;
  req.body.author = req.user._id; // 2
  Comment.findOne({_id:req.params.id},function(err,comment){
		post_Id = comment.post
	})
  Comment.deleteOne({_id: req.params.id}, function(err,comment){
	  if(err) return res.json(err);
	  return res.redirect('/posts/'+post_Id+res.locals.getPostQueryString()+'/comment');
					});
});


//////////////////////////////////////////////////////////////// HISTORY

// Index history
router.get('/:id/hists', function(req, res) {
	History.find({postId: req.params.id}, 'postId title editMsg author updatedAt')
	.populate('author')
	.sort('-updatedAt')
	.exec(function(err, hists) {
		console.log(hists);
		if (err) return res.json(err);
		res.render('hists/index', { hists: hists });
	});
});

// Show history
router.get('/:id/hists/:hid', function(req, res) {
	History.findOne({_id: req.params.hid})
	.populate('author')
	.exec(function(err, hist) {
		if (err) {
			console.log('err: ', err);
			return res.json(err);
		}
		res.render('hists/show', { hist: hist });
	});
});

// Edit history
router.get('/:id/hists/:hid/edit', util.isLoggedin, checkPermission, function(req, res) {
    var post = req.flash('post')[0];
    var errors = req.flash('errors')[0] || {};
    if (!post) {
        History.findOne({_id: req.params.hid}, function(err, post) {
            if (err) return res.json(err);
            res.render('posts/edit', { post: post, errors: errors });
        });
    }
    else {
        post._id = req.params.hid;
        res.render('posts/edit', { post: post, errors: errors });
    }
});





module.exports = router;


//////////////////////////////////////////////////////////////// PRIVATE FUNCTIONS

// 로그인 여부를 확인한 다음 블랙된 사람인지 체크
function checkPermission(req, res, next) {
   User.findOne({_id: req.user.id}, function(err, user) {
      if (err) return res.json(err);
      if (user.blacklist == false) return util.noPermission(req, res);
      
      next();
   });
}

function checkPermission2(req, res, next){ 
  Comment.findOne({_id:req.params.id}, function(err, comment){
    if(err) return res.json(err);
    if(comment.author != req.user.id) return util.noPermission(req, res);
    next();
  });
}

function checkPostId(req, res, next){ // 1
  Post.findOne({_id:req.query.postId},function(err, post){
    if(err) return res.json(err);

    res.locals.post = post; // 1-1
    next();
  });
}
import express from "express";
var router = express.Router();
// import multer from "multer";	// form에 포함된 파일을 multer로 읽어와야 함.
// var storage = multer.diskStorage({	// multer가 저장할 때 파일 간 이름 충돌을 방지하기 위해 랜덤한 이름의 바이너리 파일(확장자x)로 저장하는데 일단 원래 형식으로 저장하게끔 바꿈
// 	destination: function(req, file, cb) {
// 		cb(null, 'public/uploadedFiles/');
// 	},
// 	filename: function(req, file, cb) {
// 		cb(null, file.originalname);
// 	}
// });
// var upload = multer({ storage: storage });
// var upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });	// 메모리에 파일을 buffer로 저장하고 업로드 20 MB 제한
import Post from "../models/Post.js";
import File from "../models/File.js";
import Comment from "../models/Comment.js";
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

// Search
router.get('/search', function(req, res){
    Post.find({title: { $regex: new RegExp(req.query.search, 'i') }})
    .exec(function(err, posts) {
        if (err) return res.json(err);
        res.render('posts/search', { posts: posts });
    });
});

// New
router.get('/new', util.isLoggedin, function(req, res) {
    var post = req.flash('post')[0] || {};
    var errors = req.flash('errors')[0] || {};
    res.render('posts/new', { post: post, errors: errors });
});

// Create upload.single('attachment'), 잠시 뻈음
router.post('/', util.isLoggedin, async function(req, res) {
	// var attachment = req.file?await File.createNewInstance(req.file, req.user._id):undefined;	// form에서 받아들인 file을 토대로 File 인스턴스 생성
	// req.body.attachment = attachment;
    req.body.author = req.user._id;
    Post.create(req.body, function(err, post) {
        if (err) {
            req.flash('post', req.body);
            req.flash('errors', util.parseError(err));
            return res.redirect('/posts/new');
        }
		// if (attachment) {
		// 	attachment.postId = post._id;
		// 	attachment.save();
		// }
        res.redirect('/posts');
    });
});

// Show
router.get('/:id', function(req, res) {
	var commentForm = req.flash('commentForm')[0] || {_id: null, form: {}};
	var commentError = req.flash('commentError')[0] || { _id:null, parentComment: null, errors:{}};

	Promise.all([
		Post.findOne({_id: req.params.id}).populate({ path: 'author', select: 'username' }).populate({path: 'attachment', match: {isDeleted: false}}),
		Comment.find({post: req.params.id}).sort('createdAt').populate({ path: 'author', select: 'username' })
	])
		.then(([post, comments]) => {
			res.render('posts/show', { post:post, comments:comments, commentForm:commentForm, commentError:commentError });
		})
		.catch((err) => {
			console.log('err: ', err);
			return res.json(err);
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
    Post.findOneAndUpdate({_id: req.params.id}, req.body, {runValidators:true}, function(err, post) {
        if (err) {
            req.flash('post', req.body);
            req.flash('errors', util.parseError(err));
            return res.redirect('/posts/'+req.params.id+'/edit');
        }
        res.redirect('/posts/'+req.params.id);
    });
});

// Destroy
router.delete('/:id', util.isLoggedin, checkPermission, function(req, res) {
    Post.deleteOne({_id: req.params.id}, function(err) {
        if (err) return res.json(err);
        res.redirect('/posts');
    });
});

module.exports = router;

// Private functions
// 로그인 여부를 확인한 다음 작성자 본인이 편집하는 지 체크
function checkPermission(req, res, next) {
	Post.findOne({_id: req.params.id}, function(err, post) {
		if (err) return res.json(err);
		if (post.author != req.user.id) return util.noPermission(req, res);
		
		next();
	});
}
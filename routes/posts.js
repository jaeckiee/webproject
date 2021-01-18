import express from "express";
var router = express.Router();
import multer from "multer";	// form에 포함된 파일을 multer로 읽어와야 함.
var storage = multer.diskStorage({	// multer가 저장할 때 파일 간 이름 충돌을 방지하기 위해 랜덤한 이름의 바이너리 파일(확장자x)로 저장하는데 일단 원래 형식으로 저장하게끔 바꿈
	destination: function(req, file, cb) {
		cb(null, 'public/uploadedFiles/');
	},
	filename: function(req, file, cb) {
		cb(null, file.originalname);
	}
});
var upload = multer({ storage: storage });
import Post from "../models/Post.js";
import File from "../models/File.js";
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
router.get('/new', util.isLoggedin, function(req, res) {
    var post = req.flash('post')[0] || {};
    var errors = req.flash('errors')[0] || {};
    res.render('posts/new', { post: post, errors: errors });
});

// Create
router.post('/', util.isLoggedin, upload.single('attachment'), async function(req, res) {
	var attachment = req.file?await File.createNewInstance(req.file, req.user._id):undefined;	// form에서 받아들인 file을 토대로 File 인스턴스 생성
	req.body.attachment = attachment;
    req.body.author = req.user._id;
    Post.create(req.body, function(err, post) {
        if (err) {
            req.flash('post', req.body);
            req.flash('errors', util.parseError(err));
            return res.redirect('/posts/new');
        }
		if (attachment) {
			attachment.postId = post._id;
			attachment.save();
		}
        res.redirect('/posts');
    });
});

// Show
router.get('/:id', function(req, res) {
    Post.findOne({ _id: req.params.id })
        .populate({path: 'author', select: 'username'})
		.populate({path: 'attachment', match: {isDeleted: false}})
        .exec(function(err, post) {
            if (err) return res.json(err);
            res.render('posts/show', { post: post });
        });
});

router.get('/img', function(req, res) {
	var filePath = path.join(__dirname, '..', 'uploadedFiles', 'unknown.png');
	fs.readFile(filePath, function(err, data) {
		res.writeHead(200, { 'Content-Type': 'image/png' });
		console.log("Tlqkf" +data);
		res.write(data);
		res.end();
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
var mongoose = require('mongoose');

// schema
var fileSchema = mongoose.Schema({
	originalFileName: { type: String },
	serverFileName: { type: String },
	size: { type: Number },
	mimetype: { type: String },
	buffer: { type: Buffer },
	uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
	postId: { type: mongoose.Schema.Types.ObjectId, ref: 'post' },
	isDeleted: { type: Boolean, default: false },
});

// model & export
var File = mongoose.model('file', fileSchema);

// model methods
File.createNewInstance = async function(file, uploadedBy, postId) {
	return await File.create({
		originalFileName: file.originalname,
		serverFileName: file.filename,
		size: file.size,
		mimetype: file.mimetype,
		buffer: file.buffer,
		uploadedBy: uploadedBy,
		postId: postId,
	});
};

module.exports = File;
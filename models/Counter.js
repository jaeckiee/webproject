/* 	SQL과 달리 mongodb의 경우 보안상의 이유로 데이터의 id를 수정할 수 없기 
	때문에 게시물의 번호를 저장할 새로운 Collection을 지정하여 사용하기로 함.
	이 Collection에는 {name: 'posts', count: 0}의 데이터 하나만 들어 있으며
	새 게시물이 생성될 때마다 게시물은 이 값을 읽어와서 1을 더한 후 그 값을
	게시물 번호로 사용하며, count++을 수행함.
*/

var mongoose= require('mongoose')

// schema
var counterSchema = mongoose.Schema({
	name: {type: String, required: true},
	count: {type: Number, default: 0},
});

// model & export
var Counter = mongoose.model('counter', counterSchema);
module.exports = Counter;
var util = {};

util.parseError = function(errors) {
	var parsed = {};
	if (errors.name == 'ValidationError') {
		for (var name in errors.errors) {
			var validationError = errors.errors[name];
			parsed[name] = { message: validationError.message };
		}
	}
	else if (errors.code == '11000' && errors.errmsg.indexOf('username') > 0) {
		parsed.username = { message: 'This username already exists!' };
	}
	else {
		parsed.unhandled = JSON.stringify(errors);
	}
	return parsed;
}

util.getPostQueryString = function(req, res, next){
	res.locals.getPostQueryString = function(isAppended=false, overwrites={}) {    
		var queryString = '';
		var queryArray = [];
		var page = overwrites.page?overwrites.page:(req.query.page?req.query.page:'');
		var limit = overwrites.limit?overwrites.limit:(req.query.limit?req.query.limit:'');

		if(page) queryArray.push('page='+page);
		if(limit) queryArray.push('limit='+limit);

		if(queryArray.length>0) queryString = (isAppended?'&':'?') + queryArray.join('&');

		return queryString;
	}
	next();
}

util.isLoggedin = function(req, res, next){
	if(req.isAuthenticated()){
		next();
	} 
	else {
		req.flash('errors', {login:'Please login first'});
		res.redirect('/login');
	}
}

util.getPostQueryString = function(req, res, next){
  res.locals.getPostQueryString = function(isAppended=false, overwrites={}){
    var queryString = '';
    var queryArray = [];
    var page = overwrites.page?overwrites.page:(req.query.page?req.query.page:'');
    var limit = overwrites.limit?overwrites.limit:(req.query.limit?req.query.limit:'');
    var searchType = overwrites.searchType?overwrites.searchType:(req.query.searchType?req.query.searchType:'');
    var searchText = overwrites.searchText?overwrites.searchText:(req.query.searchText?req.query.searchText:'');

    if(page) queryArray.push('page='+page);
    if(limit) queryArray.push('limit='+limit);
    if(searchType) queryArray.push('searchType='+searchType);
    if(searchText) queryArray.push('searchText='+searchText);

    if(queryArray.length>0) queryString = (isAppended?'&':'?') + queryArray.join('&');

    return queryString;
  }
  next();
}

// 접근권한이 없음을 표현
util.noPermission = function(req, res) {
	req.flash('errors', { login: "You don't have permission" });
	req.logout();
 	res.redirect('/login');	// 어디로 리다이렉트할 지는 추후 정하기로
}

util.bytesToSize = function(bytes) {
	var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes == 0) return '0 Byte';
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

export default util;
// module.exports = util;
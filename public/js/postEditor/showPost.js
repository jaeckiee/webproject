window.onload = function() {
	
	var body = document.getElementById('body');
	body.innerHTML = body.innerText;
	
	// db에서 이미지 src들을 가져와 img태그에 채워줌.
	var postId = window.location.pathname.split("/");
	postId = postId[postId.length-1];
	$.ajax({
		type: 'get',
		url: "imgs/"+postId,
		dataType: 'json'
	})
	.done(function(imgs) {
		for (var i=0; i < imgs.length; i++)
			document.getElementById(postId+'_'+imgs[i].idx).src = imgs[i].src;
	});
	
	body.style.display = "block";
	
}
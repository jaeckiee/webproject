
$(function(){
	var socket = io();
	$('#chat').on('submit', function(e){
		socket.emit('send message', $('#name').val(), $('#message').val());
		$('#message').val('');
		$('#message').focus();
		e.preventDefault();
	});
	socket.on('receive message', function(msg){
		$('#chatLog').append(msg+'\n');
		$('#chatLog').scrollTop($('#chatLog')[0].scrollHeight);
	});
});
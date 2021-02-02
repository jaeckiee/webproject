
$(function(){
	var socket = io();
	$('#chat').on('submit', function(e){
		socket.emit('send message', $('#name').val(), $('#message').val());
		$('#message').val('');
		$('#message').focus();
		e.preventDefault();
	});
	socket.on('receive message', function(msg){
		var output = '';
		output += '<div style="width:50%; word-break: break-all"><span class="alert alert-info" style="display : inline-block;">';
		output += msg;
		output += '</span></div>';
		$('#chatLog').append(output);
		$('#chatLog').scrollTop($('#chatLog')[0].scrollHeight);
	});
	socket.on('undefined', function(msg){
		var output = '';
		output += '<div class="text-right"><span class="alert alert-danger" style="display : inline-block";>';
		output += msg;
		output += '</span></div>';
		$('#chatLog').append(output);
		$('#chatLog').scrollTop($('#chatLog')[0].scrollHeight);
	});
});
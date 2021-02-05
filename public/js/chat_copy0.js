
$(function(){
	var socket = io();
	var user_data;
	$('#chat').on('submit', function(e){
		//console.log(user_data);
		socket.emit('send message',user_data, $('#name').val(), $('#message').val());
		$('#message').val('');
		$('#message').focus();
		e.preventDefault();
	});
	$('#chatLog').ready(function(){
		$.ajax({
			type:'get',
			url:"/chat",
			dataType:"json",
			async:false,
			success:function(data){
				user_data = data;
			}
		});
		socket.emit('chat load',user_data);
		console.log("sadasd");
	});
	var recent_time;
	socket.on('receive other message', function(msg,seouldate,seoultime){
		var output = '';
		output += '<div style="width:70%; word-break: break-all"><span class="alert alert-info" style="display : inline-block;">';
		output += msg;
		output += '<span>';
		output += seoultime;
		output += '</span></span></div>';
		$('#chatLog').append(output);
		$('#chatLog').scrollTop($('#chatLog')[0].scrollHeight);
	});
	socket.on('receive my message', function(msg,seouldate,seoultime){
		var output = '';
		output += '<div class="text-right">';
		output += '<span>';
		output += seoultime;
		output += '</span>';
		output += '<div style="width:70%; display : inline-block; word-break: break-all"><span class="alert alert-info" style="display : inline-block;">';
		output += msg;
		output += '</span></div></div>';
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
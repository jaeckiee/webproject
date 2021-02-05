
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
	});
	var recent_date='';
	socket.on('receive other message', function(msg,seouldate,seoultime){
		if(recent_date != seouldate){
			recent_date = seouldate;
			var output_date = '';
			output_date += '<div class="text-center"><span style="inline-block">';
			output_date += recent_date;
			output_date += '</span></div>';
			$('#chatLog').append(output_date);
		}
		var output = '';
		output += '<div class="text-left"><div style="width:85%; display : inline-block;">';
		output += '<div style="display : inline-block; max-width : 80%;">';
		output += '<span class="alert alert-info" style="display : inline-block; word-break: break-all">';
		output += msg;
		output += "</span></div>"
		output += '<div style="display : inline-block;"><span>';
		output += seoultime;
		output += '</span></div></div></div>';
		$('#chatLog').append(output);
		$('#chatLog').scrollTop($('#chatLog')[0].scrollHeight);
	});
	socket.on('receive my message', function(msg,seouldate,seoultime){
		if(recent_date != seouldate){
			recent_date = seouldate;
			var output_date = '';
			output_date += '<div class="text-center"><span style="inline-block">';
			output_date += recent_date;
			output_date += '</span></div>';
			$('#chatLog').append(output_date);
		}
		var output = '';
		output += '<div class="text-right"><div style="width:85%; display : inline-block;">';
		output += '<div style="display : inline-block;">';
		output += '<span>';
		output += seoultime;
		output += '</span></div>';
		output += '<div style="display : inline-block; max-width : 80%;">';
		output +='<span class="alert alert-info text-left" style="display : inline-block; word-break: break-all;">';
		output += msg;
		output += '</span></div></div></div>'
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
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var users = [];

app.get('/', function(req, res){
	res.sendFile(__dirname + '/socket.html');
});

io.on('connection', function(socket){
	/********     登录聊天室操作    ********/
	socket.on('login', function(userData){
		if(users.indexOf(userData.nickname) > -1) {
			socket.emit('nicknameExits');
		}
		else {
			let b = /<[^>]*>|<\/[^>]*>/gm;
			socket.userIndex = users.length;
			userData.nickname = userData.nickname.split(b).join(' ');
			socket.nickname = userData.nickname;
			socket.avatar = '<img src="' + userData.avatar +'" alt="" />';
			users.push(userData);
			data = userData;
			socket.emit('loginSuccess', data);
			io.emit('system', data, users.length, 'login');
		}
	})

	/********     离开聊天室操作    ********/
	socket.on('disconnect', function(){
		data = users.pop();
		users.splice(socket.userIndex, 1);
		socket.broadcast.emit('system', data, users.length, 'logout');
	})

	/********     群聊信息发送    ********/
	socket.on('chat message', function(msg){
		let t = '&nbsp;';
		let b = /<[^>]*>|<\/[^>]*>/gm;
		msg.words = msg.words.split(" ").join(t).split('\n').join('</br>').split(b).join(' ');
		msg.name = msg.name.split(" ").join(t);
		msg.avatar = msg.avatar;
		io.emit('chat message', msg);
	});

	/********    图片的操作    ********/
	socket.on('chat img', function(imgMsg){
		imgMsg.img = '<img src="' + imgMsg.img +'" alt="" />';
		io.emit('chat img', imgMsg);
	});
});

app.use(require('express').static(path.join(__dirname, './public')));

http.listen(3100, function(){
	console.log('listening on *:3100');
})

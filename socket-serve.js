var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var tools = require('./transferImg');
var users = [];

app.get('/', function(req, res){
	res.sendFile(__dirname + '/socket.html');
});


io.on('connection', function(socket){
	let nickname, userIndex;
	/********     登录聊天室操作    ********/
	socket.on('login', function(userData){
		if(users.indexOf(userData.nickname) > -1) {
			socket.emit('nicknameExits');
		} else {
			let b = /<[^>]*>|<\/[^>]*>/gm;
			userIndex = users.length;
			userData.avatar = tools.TransferBase64(tools.Format(userData.avatar));
			// socket.avatar = userData.avatar;
			userData.nickname = userData.nickname.split(b).join(' ');
			nickname = userData.nickname;
			users.push(userData);
			socket.emit('loginSuccess', userData);
			io.sockets.emit('system', userData.nickname, users.length, 'login');
		}
	})

	/********     离开聊天室操作    ********/
	socket.on('disconnect', () => {
		// let nickname = socket.nickname;
		console.log('kuhkuyghji');
		console.log(nickname, userIndex);
		if(nickname !== undefined){
			users.splice(userIndex, 1);
			socket.broadcast.emit('system', nickname, users.length, 'logout');
		}
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
		imgMsg.img = '<img src="' + tools.TransferBase64(tools.Format(imgMsg.img)) +'" alt="" />';
		io.emit('chat img', imgMsg);
	});

	/********    文件的操作    *********/
	socket.on('chat file', function(fileMsg){
		let data = tools.TransferBase64(tools.Format(fileMsg.file));
		let name = data.split('recvFile/')[1];
		console.log('data::' + data);
		fileMsg.file = `<a href="${data}" download="${data}"><img src="/img/send-success.png" alt="" /><span>${name}</span></a>`;
		io.emit('chat file', fileMsg);
	})
});


app.use(require('express').static(path.join(__dirname, './public')));

http.listen(3100, function(){
	console.log('listening on *:3100');
})

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var tools = require('./transferImg');
var users = [];
var rooms = {
	'Group Chat': {
		users: [],
		list: []
	},
	'My Partner': {
		users: [],
		list: []
	},
	'Hello!': {
		users: [],
		list: []
	},
	'Play Together!': {
		users: [],
		list: []
	}
};

app.get('/', function(req, res){
	res.sendFile(__dirname + '/socket.html');
});


io.on('connection', function(socket){
	let nickname, ttUserIndex, userIndex, preRoom = '';
	/********     登录聊天室操作    ********/
	socket.on('login', (userData) => {
		if(users.indexOf(userData.nickname) > -1) {
			socket.emit('nicknameExits');
		} else {
			let b = /<[^>]*>|<\/[^>]*>/gm;
			userData.avatar = tools.TransferBase64(tools.Format(userData.avatar));
			userData.nickname = userData.nickname.split(b).join(' ');
			users.push(userData.nickname);
			ttUserIndex = users.length;
			nickname = userData.nickname;
			socket.emit('loginSuccess', userData);
		}
	})

	socket.on('enter', (data) => {
		if(preRoom !== ''){
			socket.leave(preRoom);
			rooms[preRoom].users.splice(userIndex-1, 1);
			socket.to(preRoom).emit('system', data.room, data.userData.nickname, rooms[preRoom].users, 'logout');
		}
		socket.join(data.room);
		rooms[data.room].users.push(data.userData);
		userIndex = rooms[data.room].users.length;
		if(rooms[data.room].list.length !== '0'){
			socket.emit('clean board', rooms[data.room].list);
		}
		io.to(data.room).emit('system', data.room, data.userData.nickname, rooms[data.room].users, 'login');
		preRoom = data.room;
	})

	/********     离开聊天室操作    ********/
	socket.on('disconnect', () => {
		console.log('kuhkuyghji');
		console.log(nickname, userIndex);
		if(preRoom !== ''){
			rooms[preRoom].users.splice(userIndex-1, 1);
			users.splice(ttUserIndex-1, 1);
			console.log(users.length);
			io.to(preRoom).emit('system', preRoom, nickname, rooms[preRoom].users, 'logout');
		}
	})

	/********     群聊信息发送    ********/
	socket.on('chat message', function(msg){
		let t = '&nbsp;';
		let b = /<[^>]*>|<\/[^>]*>/gm;
		msg.content = msg.content.split(" ").join(t).split('\n').join('</br>').split(b).join(' ');
		msg.userData.nickname = msg.userData.nickname.split(" ").join(t);
		msg.userData.avatar = msg.userData.avatar;
		let chat = {
			userData: {
				nickname: msg.userData.nickname,
				avatar: msg.userData.avatar
			},
			content: msg.content
		};
		rooms[msg.room].list.push(chat);
		io.to(msg.room).emit('chat message', chat);
	});

	/********    图片的操作    ********/
	socket.on('chat img', function(msg){
		msg.img = '<img src="' + tools.TransferBase64(tools.Format(msg.img)) +'" alt="" />';
		let chat = {
			userData: {
				nickname: msg.userData.nickname,
				avatar: msg.userData.avatar
			},
			content: msg.img
		};
		rooms[msg.room].list.push(chat);
		io.to(msg.room).emit('chat img', chat);
	});

	/********    文件的操作    *********/
	socket.on('chat file', function(msg){
		let data = tools.TransferBase64(tools.Format(msg.file));
		let name = data.split('recvFile/')[1];
		console.log('data::' + data);
		msg.file = `<a href="${data}" download="${data}"><img src="/img/send-success.png" alt="" /><span>${name}</span></a>`;
		let chat = {
			userData: {
				nickname: msg.userData.nickname,
				avatar: msg.userData.avatar
			},
			content: msg.file
		};
		rooms[msg.room].list.push(chat);
		io.to(msg.room).emit('chat file', chat);
	})
});


app.use(require('express').static(path.join(__dirname, './public')));

http.listen(3100, function(){
	console.log('listening on *:3100');
})

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
// var _ = require('underscore');
//  将图片缓存到本地的方法
var tools = require('./transferImg');
//  记录在线人的数组
var users = [];
var socketIds = {};
//  定义存储房间信息（在线人信息和聊天记录）的数据结构
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

app.use(require('express').static(path.join(__dirname, './public')));

http.listen(3333, function(){
	console.log('listening on *:3333');
})


io.on('connection', function(socket){
	console.log('***********');
	console.log(socket.id);
	let nickname, ttUserIndex, userIndex, preRoom = '';
	var socketId = socket.id;
	/********     登录聊天室操作    ********/
	socket.on('login', (userData) => {
		if(users.indexOf(userData.nickname) > -1) {
			socket.emit('nicknameExits');
		} else {
			let b = /<[^>]*>|<\/[^>]*>/gm;
			userData.avatar = tools.TransferBase64(tools.Format(userData.avatar));
			userData.nickname = userData.nickname.split(b).join(' ');
			users.push(userData.nickname);
			socketIds[userData.nickname] = socketId;
			ttUserIndex = users.length;
			nickname = userData.nickname;
			setTimeout(()=>{
				socket.emit('loginSuccess', userData);
			}, 500);
		}
	})

	/********     切换聊天室操作    ********/
	socket.on('enter', (data) => {
		/********     登出原有聊天室    ********/
		if(preRoom !== ''){
			socket.leave(preRoom);
			rooms[preRoom].users.splice(userIndex-1, 1);
			socket.to(preRoom).emit('system', data.room, data.userData.nickname, rooms[preRoom].users, 'logout');
		}
		/********     加入新聊天室    ********/
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
		users.splice(ttUserIndex-1, 1);
		delete socketIds[nickname];
		console.log("************");
		console.log(socketIds);
		if(preRoom !== ''){
			rooms[preRoom].users.splice(userIndex-1, 1);
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

	/********    私聊操作    ********/
	socket.on('personol chat', function(msg){
		let t = '&nbsp;';
		let b = /<[^>]*>|<\/[^>]*>/gm;
		msg.content = msg.content.split(" ").join(t).split('\n').join('</br>').split(b).join(' ');
		msg.userData.nickname = msg.userData.nickname.split(" ").join(t);
		msg.userData.avatar = msg.userData.avatar;
		let myWords = `<p class="personal-chat-words">你给${msg.to}说了句悄悄话:</p>${msg.content}`;
		let otherWords = `<p class="personal-chat-words">${msg.userData.nickname}给你说了句悄悄话:</p>${msg.content}`;
		let myChat = {
			userData: {
				nickname: msg.userData.nickname,
				avatar: msg.userData.avatar
			},
			content: myWords
		};
		let otherChat = {
			userData: {
				nickname: msg.userData.nickname,
				avatar: msg.userData.avatar
			},
			content: otherWords
		}
		socket.emit('chat message', myChat);
		io.to(socketIds[msg.to]).emit('chat message', otherChat);
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




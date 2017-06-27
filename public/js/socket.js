var submit = document.getElementById('input-send');
var input = document.getElementById('input-area');
var chatCon = document.getElementById('chatting-container');
var title = document.getElementById('chatting-name');
var rooms = document.getElementsByClassName('users-room');
var usersList = document.getElementById('users-list');
var OriTitle = title.innerHTML;
var nickname = '';
var indexRoom = '';

$('.chatting-container').css("height", $(window).height() - $('.chatting-title').height() - $('.input-container').height() - 2);
$('.whether-choose').css("height", $(window).height() - $('.chatting-title').height());
$('.users-list').css("height", $(window).height() - $('.my-detail').height() - 60).css("max-height", $(window).height() - $('.my-detail').height() - 60);

function ChooseChat(e){
	if(e.target.innerHTML.length > 200) return ;
	let tar = e.target.innerHTML.length < 20 ? e.target.parentNode.innerHTML : e.target.innerHTML;
	tar = tar.split('<span class="your-name">')[1].split('</span>')[0];
	console.log(tar);
	$('.whether-choose').removeClass('disappear');
	for(i = 0; i < rooms.length; i++){
		let check = rooms[i].innerHTML.split('<span class="your-name">')[1].split('</span>')[0];
		if(tar === check){
			rooms[i].style.backgroundColor = '#3a3f45';
			indexRoom = tar;
			socket.emit('enter', {
				room: tar,
				userData: {
					nickname: nickname,
					avatar: avatar
				}
			})
		} else {
			rooms[i].style.backgroundColor = '#2e3641';
		}
	}
	$('.whether-choose').addClass('disappear');
}

usersList.addEventListener('click', ChooseChat);

// 系统提醒的封装函数
function System(msg){
	let content = chatCon.innerHTML;
	content += `<p class="system-alert">--------${msg}--------</p>`;
	chatCon.innerHTML = content;
	chatCon.scrollTop = chatCon.scrollHeight;
}

function SubmitCtrl(){
	console.log("click submit");
	var words = input.value.trim();
	if(words !== ''){
		socket.emit('chat message', {
			room: indexRoom,
			userData: {
					nickname: nickname,
					avatar: avatar
				},
			content: words
		});
	}
	input.value = '';
}

//  聊天信息发送按钮事件监听
submit.addEventListener('click', SubmitCtrl);

//  键盘事件
window.onkeydown = function(event){
	var e = event || window.event;
		if(e && e.keyCode == 13){ // enter 键
			SubmitCtrl();
		}
};

function AppendChat(msgAvatar, msgName, msgContent){
	let HTML = chatCon.innerHTML;
	let whitchSide;
	if(msgName == nickname){
		HTML += `
		<div class="one-side chatting-box">
			<img class="user-avatar" src="${msgAvatar}">
			<div class="chatting-aside-container">
				<div class="chat-aside-container">
					<div class="chatting-nickname">${msgName}</div>
					<div class="chatting-box-con">
						<div class="chat-words-con">
							${msgContent}
						</div>
						<div class="chatting-left-triangle"></div>
					</div>
				</div>
			</div>
		</div>`;
	} else {
		HTML += `
		<div class="the-other-side chatting-box">
			<img class="user-avatar" src="${msgAvatar}">
			<div class="chatting-detail-container">
				<div class="chat-aside-container">
					<div class="chatting-nickname">${msgName}</div>
					<div class="chatting-box-con">
						<div class="chatting-right-triangle"></div>
						<div class="chat-words-con">
							${msgContent}
						</div>
					</div>
				</div>
			</div>
		</div>`;
	}
	chatCon.innerHTML = HTML;
	chatCon.scrollTop = chatCon.scrollHeight;
}

//  接收 socket 发送回的信息，并在聊天页面中显示出来
this.socket.on('chat message', function(msg){
	console.log("click socket");
	console.log(msg);
	AppendChat(msg.userData.avatar, msg.userData.nickname, msg.content);
});

usersLine = document.getElementsByClassName('users-line')[0];

function AppendUsers(avatar, nickname){
	content = `
		<div class="users-detail">
			<img class="line-avatar" src="${avatar}">
			<div class="line-user-name">${nickname}</div>
		</div>`;
	usersLine.innerHTML += content;
}

// when number changes, alert
this.socket.on('system', function(room, nickname, users, type) {
	let len = users.length, i;
	title.innerHTML = `${room}(${len})<img class="title-label" src="/img/more_unfold.png">`;
	let msg = nickname + (type == 'login' ? '加入聊天' : '已离开');
	usersLine.innerHTML = '';
	for(i = 0; i < len; i++){
		console.log(users[i]);
		AppendUsers(users[i].avatar, users[i].nickname);
	}
	System(msg);
})

//监听 toggle 事件
$('#chatting-name').on('click', 'img', () => {
	console.log('click3333');
	$(".users-line").slideToggle("slow");
});

//  listen img btn
var img = document.getElementById('get-img');
img.addEventListener('change', function(){
	console.log("click");
	var file = img.files[0];
	let reg =  /image\/\w+/;
		if(!reg.test(file.type)){
			alert('请确保上传的头像文件为图像类型！');
			return;
		}
	//获取文件并用FileReader进行读取
	var reader = new FileReader();
	if (!reader) {
		System('你的浏览器不支持此功能，请更换高版本的浏览器');
		this.value = '';
		return;
	};
	reader.onload = function(e) {
		//读取成功，显示到页面并发送到服务器
		this.value = '';
		socket.emit('chat img', {
			room: indexRoom,
			userData: {
					nickname: nickname,
					avatar: avatar
				},
			img: e.target.result,
		});
	};
	//将文件以Data URL形式读入页面
	reader.readAsDataURL(file);
})

//  对服务器发送过来的 chat img 操作
socket.on('chat img', function(msg) {
	AppendChat(msg.userData.avatar, msg.userData.nickname, msg.content);
})

// 传文件操作
var file = document.getElementById('deliver-file');

file.addEventListener('change', function(){
	console.log("click");
	var doc = file.files[0];
	//获取文件并用FileReader进行读取
	var reader = new FileReader();
	if (!reader) {
		System('你的浏览器不支持此功能，请更换高版本的浏览器');
		this.value = '';
		return;
	};
	reader.onload = function(e) {
		//读取成功，显示到页面并发送到服务器
		this.value = '';
		socket.emit('chat file', {
			room: indexRoom,
			userData: {
					nickname: nickname,
					avatar: avatar
				},
			file: e.target.result,
		});
	};
	//将文件以Data URL形式读入页面
	reader.readAsDataURL(doc);
})

//  对服务器发送过来的 chat file 操作
socket.on('chat file', function(msg) {
	AppendChat(msg.userData.avatar, msg.userData.nickname, msg.content);
})

socket.on('loginSuccess', function(userData) {
	nickname = userData.nickname;
	avatar = userData.avatar;
	document.getElementsByClassName('my-detail')[0].innerHTML = `<img class="my-avatar" id="my-avatar" src="${avatar}">
		<span class="my-name" id="my-name">${nickname}</span>`
	console.log(userData);
	console.log(`../${avatar}`);
	$('.login-container').addClass('disappear');
 });

socket.on('clean board', (data) => {
	chatCon.innerHTML = '';
	let len = data.length;
	console.log(data);
	for(i = 0; i < len; i++){
		console.log(data[i]);
		AppendChat(data[i].userData.avatar, data[i].userData.nickname, data[i].content);
	}
})

var socket = io();
var submit = document.getElementById('input-send');
var input = document.getElementById('input-area');
var chatCon = document.getElementById('chatting-container');
var title = document.getElementById('chatting-name');
var OriTitle = title.innerHTML;
var nickname = '';

var chat = function() {
	this.socket = null;
}

chat.prototype = {
	init: function() {
		this.socket = io.connect();
	}
}

$('.chatting-container').css("height", $(window).height() - $('.chatting-title').height() - $('.input-container').height()) ;
console.log($(window).height() , $('.chatting-title').height() , $('.input-container').height());
$('.users-list').css("height", $(window).height() - $('.my-detail').height() - 60).css("max-height", $(window).height() - $('.my-detail').height() - 60);

// 系统提醒的封装函数
function System(msg){
	let content = chatCon.innerHTML;
	content += `<p class="system-alert">${msg}</p>`;
	chatCon.innerHTML = content;
}

function SubmitCtrl(){
	var data = input.value.trim();
	if(data !== ''){
		socket.emit('chat message', {
			avatar: avatar,
			name: nickname,
			words: data
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
	// console.log(msg);
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
socket.on('chat message', function(msg){
	AppendChat(msg.avatar, msg.name, msg.words);
});



// when number changes, alert
socket.on('system', function(userData, userCount, type) {
	title.innerHTML = `${OriTitle} (${userCount})`;
	let msg = userData.nickname + (type == 'login' ? '加入群聊' : '离开群聊');
	System(msg);
})

//  listen img btn
var img = document.getElementById('get-img');
img.addEventListener('change', function(){
	console.log("click");
	var file = img.files[0];
	let reg =  /^(\s|\S)+(jpg|png|JPG|PNG)+$/;
	if(!reg.test(file.type)){
		System('请选择扩展名为png或jpg格式的图片！');
		return false;
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
			img: e.target.result,
			avatar: avatar,
			nickname: nickname
		});
	};
	//将文件以Data URL形式读入页面
	reader.readAsDataURL(file);
})

//  对服务器发送过来的 chat img 操作
socket.on('chat img', function(msg) {
	AppendChat(msg.avatar, msg.nickname, msg.img);
})

socket.on('loginSuccess', function(userData) {
	nickname = userData.nickname;
	avatar = userData.avatar;
	document.getElementsByClassName('my-detail')[0].innerHTML = `<img class="my-avatar" id="my-avatar" src="${avatar}">
		<span class="my-name" id="my-name">${nickname}</span>`
	console.log(userData);
	$('.login-container').addClass('disappear');
 });

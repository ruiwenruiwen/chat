var socket = io();
var nameInput = document.getElementById('name');
var selectAvatar = document.getElementById('select-avatar');
var avatar = '';

selectAvatar.addEventListener('change', function(){
	if(this.files.length != 0){
		var file = selectAvatar.files[0];
		let reg =  /image\/\w+/;
		if(!reg.test(file.type)){
			alert('请确保上传的头像文件为图像类型！');
			return;
		}
		//获取文件并用FileReader进行读取
		var reader = new FileReader();
		if (!reader) {
			alert('你的浏览器不支持此功能，请更换高版本的浏览器');
			this.value = '';
			return;
		};
		//将文件以Data URL形式读入页面
		reader.readAsDataURL(file);
		reader.onload = e => {
			$('.avatar-con').css('background-image','url(../img/uploadSucc.png)');
			this.value = '';
			avatar = e.target.result;
		};
	}
});

// 注册 submit 事件
$('#login-submit').click(function(){
	if(avatar !== '') {
		function GetLength(str){
			 return str.replace(/[\u0391-\uFFE5]/g,"aa").length;
		}
		let nickname = nameInput.value;
		if(GetLength(nickname.trim()) >= 2 && GetLength(nickname.trim()) <= 20){
			console.log('submit');
		} else {
			nameInput.value = '';
			alert("输入昵称需要在2到20个字符里面");
			return false;
		}
		// 信息无误，弹射信息到服务端，完成上传图片，注册
		socket.emit('login',{
			nickname: nickname,
			avatar: avatar
		});
	}
	else {
		alert("请选择头像");
		return false;
	}
	console.log("success");

});

// nicknameExits
socket.on('nicknameExits', function() {
	alert('昵称有重复，请重新输入');
	nameInput.value = ' ';
});

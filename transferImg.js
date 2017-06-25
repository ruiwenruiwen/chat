const uuid = require('uuid/v1');
var fs = require('fs');

var transferImg = {};

module.exports = transferImg;

transferImg.Format = data => {
	// var timestamp = Date.parse(new Date());
	let name = uuid();
	return img = {
		type: data.split('/')[1].split(';')[0],
		fileName: name,
		base64: data.split(';base64,')[1]
	}
}

transferImg.TransferBase64 = data => {
	let path, buf;
	path = `public/recvFile/${data.fileName}.${data.type}`;
	console.log(data.type);
	console.log(data.fileName);
	buf = new Buffer(data.base64, 'base64');
	fs.writeFile(path, buf, (err) => {
		if (err) {
			console.log(err);
		} else {
			console.log('ok.');
		}
	});
	return path.replace('public/', '');
}

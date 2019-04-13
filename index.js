const { Encoder, ErrorCorrectLevel, QRKanji, QR8BitByte } = require('./es5');

const qrcode = new Encoder();

qrcode.addData('世界你好！\n');
qrcode.addData(new QR8BitByte('hello world !\n'));
qrcode.addData(new QRKanji('こんにちは世界！'));

qrcode.setVersion(6);
qrcode.setErrorCorrectLevel(ErrorCorrectLevel.H);
qrcode.make();

console.log(qrcode.toDataURL());

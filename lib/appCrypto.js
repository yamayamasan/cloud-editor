'use strict';

const crypto = require('crypto');

const ENCODE_ARGORYTHM = 'aes-256-cbc';
const DECODE_ARGORYTHM = 'aes256';

function AppCrypto() {
  const key = 'bFr3r5iRkiTWf3r-a8GsHVZUgpAtDL7X';
  const iv = '5xWAzpRh6TgybfGd';
  this.key = new Buffer(key, 'utf8');
  this.iv = new Buffer(iv, 'utf8');
}

AppCrypto.prototype.encode = function(text) {
  const cipher = crypto.createCipheriv(ENCODE_ARGORYTHM, this.key, this.iv);
  const encoded = cipher.update(text, 'utf8', 'binary');
  return `${encoded}${cipher.final('binary')}`;
};

AppCrypto.prototype.decode = function(hash) {
  const decipher = crypto.createDecipheriv(DECODE_ARGORYTHM, this.key, this.iv);
  const decoded = decipher.update(hash, 'binary', 'utf8');
  return `${decoded}${decipher.final('utf8')}`;
};

AppCrypto.prototype.compare = function(text, hash) {
  const decoded = this.decode(hash);
  console.log('text:', text, '||decode:', decoded);
  return decoded === text;
};


module.exports = new AppCrypto;

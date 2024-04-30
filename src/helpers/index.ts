import crypto from 'crypto';

const SECRET = 'THINAS-AUTH-REST-API';

function random() {
  return crypto.randomBytes(128).toString('base64');
}

function authentication(salt: string, password: string) {
  return crypto.createHmac('sha256', [salt, password].join('/')).update(SECRET).digest();
}

export { random, authentication };
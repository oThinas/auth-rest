import crypto from 'crypto';

function random() {
  return crypto.randomBytes(128).toString('base64');
}

function authentication(salt: string, password: string) {
  return crypto.createHmac('sha256', [salt, password].join('/')).update(process.env.SECRET).digest('hex');
}

export { random, authentication };
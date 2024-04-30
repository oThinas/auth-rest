import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  authentication: {
    password: { type: String, required: true, select: false },
    salt: { type: String, select: false },
    sessionToken: { stype: String, select: false },
  },
});

export const UserModel = mongoose.model('User', UserSchema);

function getUsers() {
  return UserModel.find();
}

function getUserByEmail(email: string) {
  return UserModel.findOne({ email });
}

function getUserBySessionToken(sessionToken: string) {
  return UserModel.findOne({ 'authentication.sessionToken': sessionToken });
}

function getUserById(id: string) {
  return UserModel.findById(id);
}

function createUser(values: Record<string, any>) {
  return new UserModel(values).save().then((user) => user.toObject());
}

function deleteUserById(id: string) {
  return UserModel.findByIdAndDelete({ _id: id });
}

function updateUserById(id: string, values: Record<string, any>) {
  return UserModel.findByIdAndUpdate(id, values)
}

export {
  getUsers,
  getUserByEmail,
  getUserBySessionToken,
  getUserById,
  createUser,
  deleteUserById,
  updateUserById,
};

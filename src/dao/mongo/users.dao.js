const User = require('../../models/user');

class UsersDAO {
  getByEmailWithPassword(email) {
    return User.findOne({ email });
  }

  getByEmail(email) {
    return User.findOne({ email }).select('-password -__v');
  }

  getById(id) {
    return User.findById(id).select('-password -__v');
  }

  getAll() {
    return User.find().select('-password -__v');
  }

  create(data) {
    return User.create(data);
  }


  updateById(id, data) {
    return User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).select('-password -__v');
  }

   deleteById(id) {
    return User.findByIdAndDelete(id).select('-password -__v');
  }

   findByResetToken(token) {
    return User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
  }
}

module.exports = UsersDAO;




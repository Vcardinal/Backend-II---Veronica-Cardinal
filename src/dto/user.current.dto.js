class UserCurrentDTO {
  constructor(user) {
    this.id = user?._id?.toString?.() || user?.id || null;
    this.first_name = user?.first_name || null;
    this.last_name = user?.last_name || null;
    this.email = user?.email || null;
    this.role = user?.role || null;
    this.cart = user?.cart || null;
  }
}

module.exports = UserCurrentDTO;

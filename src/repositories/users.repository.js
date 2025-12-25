class UsersRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getByEmail(email) {
    return this.dao.getByEmail(email);
  }

  getById(id) {
    return this.dao.getById(id);
  }

  getAll() {
    return this.dao.getAll();
  }

  create(data) {
    return this.dao.create(data);
  }

  updateById(id, data) {
    return this.dao.updateById(id, data);
  }

  deleteById(id) {
    return this.dao.deleteById(id);
  }
}

module.exports = UsersRepository;

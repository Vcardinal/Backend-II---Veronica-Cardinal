const bcrypt = require('bcrypt');

class UsersService {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }

  async register({ first_name, last_name, email, password, age }) {
    if (!first_name || !last_name || !email || !password) {
      const err = new Error('Faltan campos obligatorios');
      err.status = 400;
      throw err;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await this.usersRepository.getByEmail(normalizedEmail);
    if (existing) {
      const err = new Error('El email ya está registrado');
      err.status = 400;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.usersRepository.create({
      first_name,
      last_name,
      email: normalizedEmail,
      password: hashedPassword,
      age,
      role: 'user',
    });
  }

  async getAll() {
    return this.usersRepository.getAll();
  }

  async getById(id) {
    return this.usersRepository.getById(id);
  }
}

module.exports = UsersService;

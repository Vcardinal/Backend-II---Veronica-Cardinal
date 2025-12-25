const UsersDAO = require('../dao/mongo/users.dao');
const UsersRepository = require('../repositories/users.repository');
const UsersService = require('../services/users.service');
const AuthService = require('../services/auth.service');
const mailer = require('../utils/mailer');

const usersDAO = new UsersDAO();
const usersRepository = new UsersRepository(usersDAO);
const usersService = new UsersService(usersRepository);

const authService = new AuthService(usersDAO, mailer);

module.exports = {
  usersService,
  authService,
};

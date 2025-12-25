const express = require('express');
const passport = require('passport');
const router = express.Router();

const { generateToken } = require('../config/jwt');
const UserCurrentDTO = require('../dto/user.current.dto');

const { authService } = require('../config/dependencies');
const UsersDAO = require('../dao/mongo/users.dao');

const usersDAO = new UsersDAO();

router.post('/login', (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Faltan credenciales' });
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res
        .status(401)
        .json({ message: info?.message || 'Credenciales inválidas' });
    }

    req.session.regenerate((err) => {
      if (err) return next(err);

      req.login(user, (err) => {
        if (err) return next(err);

        req.session.user = {
          id: user._id,
          email: user.email,
          role: user.role,
        };

        const token = generateToken(user);

        return res.json({
          message: 'Login exitoso',
          user: req.session.user,
          token,
        });
      });
    });
  })(req, res, next);
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  if (req.session?.user) return next();
  return res.status(401).json({ message: 'No autorizado, iniciá sesión' });
}

router.get('/me', isAuthenticated, (req, res) => {
  res.json({
    message: 'Datos de la sesión actual',
    user: req.session.user || null,
    passportUser: req.user || null,
  });
});

router.get('/current', isAuthenticated, async (req, res, next) => {
  try {
    if (req.user) {
      return res.json({
        message: 'Usuario actual',
        user: new UserCurrentDTO(req.user),
      });
    }

    const sessionUser = req.session?.user;
    if (!sessionUser?.id) {
      return res.status(401).json({ message: 'No autorizado' });
    }

       const userDb = await usersDAO.getById(sessionUser.id);
    if (!userDb) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    return res.json({
      message: 'Usuario actual',
      user: new UserCurrentDTO(userDb),
    });
  } catch (err) {
    next(err);
  }
});


router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body || {};
    await authService.forgotPassword(email);

  
    return res.json({
      message: 'Si el email existe, se envió el enlace de recuperación',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body || {};
    await authService.resetPassword(token, newPassword);

    return res.json({
      message: 'Contraseña actualizada correctamente',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);

    res.clearCookie('connect.sid');
    return res.json({ message: 'Sesión cerrada' });
  });
});

module.exports = router;








// src/routes/session.routes.js
const express = require('express');
const passport = require('passport');
const router = express.Router();
const { generateToken } = require('../config/jwt');


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


router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);

    res.clearCookie('connect.sid');
    return res.json({ message: 'Sesión cerrada' });
  });
});

module.exports = router;






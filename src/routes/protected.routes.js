// src/routes/protected.routes.js
const express = require('express');
const router = express.Router();

const { isAuth, requiredRole } = require('../middlewares/auth');
const { jwtAuth } = require('../middlewares/jwtAuth');


router.get('/ping', isAuth, (req, res) => {
  const sessionUser = req.session?.user || null;

  res.json({
    message: 'pong privado',
    user: sessionUser,
  });
});


router.get('/admin-info', isAuth, requiredRole('admin'), (req, res) => {
  const sessionUser = req.session?.user || null;

  res.json({
    message: 'Solo admins pueden ver esto',
    user: sessionUser,
  });
});


router.get('/jwt-ping', jwtAuth, (req, res) => {
  res.json({
    message: 'pong con JWT',
    user: req.jwtUser,
  });
});

module.exports = router;


const express = require('express');
const router = express.Router();

const { isAuth, authorizeRoles } = require('../middlewares/auth');
const jwtAuth = require('../middlewares/jwtAuth');

router.get('/admin-info', isAuth, authorizeRoles('admin'), (req, res) => {
  const user = req.user || req.session?.user || null;

  res.json({
    message: 'Solo admins pueden ver esto',
    user,
  });
});

router.get('/jwt-ping', jwtAuth, (req, res) => {
  res.json({
    message: 'pong con JWT',
    user: req.jwtUser,
  });
});

module.exports = router;


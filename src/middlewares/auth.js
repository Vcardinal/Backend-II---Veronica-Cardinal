// src/middlewares/auth.js

const isAuth = (req, res, next) => {

  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  if (req.session?.user) {
    return next();
  }

  return res.status(401).json({
    message: 'No autorizado, iniciá sesión',
  });
};


const requiredRole = (role) => {
  return (req, res, next) => {

    const passportRole = req.user?.role;
    const sessionRole = req.session?.user?.role;
    const currentRole = passportRole || sessionRole;

    if (currentRole === role) {
      return next();
    }

    return res.status(403).json({
      message: `Acceso denegado: se requiere rol ${role}`,
    });
  };
};

module.exports = {
  isAuth,
  requiredRole,
};

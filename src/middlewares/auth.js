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

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const role =
      req.user?.role ||        // Passport
      req.session?.user?.role; // Session

    if (!role) {
      return res.status(401).json({
        message: 'No autorizado',
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: 'Acceso denegado para este rol',
      });
    }

    next();
  };
};

module.exports = {
  isAuth,
  authorizeRoles,
};


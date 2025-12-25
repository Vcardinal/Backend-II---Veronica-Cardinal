const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const role =
      req.user?.role ||        
      req.session?.user?.role; 

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

module.exports = authorizeRoles;

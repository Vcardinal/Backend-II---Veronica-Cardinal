// Middleware manejo de errores
const errorMW = (err, _req, res, _next) => {
  console.error('❌ Error detectado:', err);

  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(status).json({
    status: 'error',
    message,
  });
};

module.exports = { errorMW };

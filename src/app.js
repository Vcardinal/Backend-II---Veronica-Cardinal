const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const passport = require('passport');
require('./config/passport');

const app = express();

const userRoutes = require('./routes/user.routes');
const sessionRoutes = require('./routes/session.routes');
const protectedRoutes = require('./routes/protected.routes');
const productsRoutes = require('./routes/products.routes');
const cartsRoutes = require('./routes/carts.routes');
const ticketsRoutes = require('./routes/tickets.routes');


const { errorMW } = require('./middlewares/error');
const { sessionMW } = require('./config/session');


app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));


app.use(express.static(path.join(__dirname, 'public')));


app.use(sessionMW());
app.use(passport.initialize());
app.use(passport.session());


app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// APIs
app.use('/api/users', userRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/carts', cartsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/private', protectedRoutes);


app.use((req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ message: 'Ruta no encontrada' });
  }
  return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(errorMW);

module.exports = app;










// src/app.js
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

// 🔐 Passport
const passport = require('passport');
require('./config/passport');


const { engine } = require('express-handlebars');

// Rutas
const userRoutes = require('./routes/user.routes');
const sessionRoutes = require('./routes/session.routes');
const protectedRoutes = require('./routes/protected.routes');

// Middlewares custom
const { errorMW } = require('./middlewares/error');
const { sessionMW } = require('./config/session');

const app = express();

/* -------------------- MIDDLEWARES -------------------- */
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.engine(
  'handlebars',
  engine({
    defaultLayout: 'main',
  })
);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));


app.use(sessionMW());

app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next) => {
  res.locals.user = req.user || req.session?.user || null;
  next();
});


app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.status(200).render('home', {
    title: 'Backend II - Home',
  });
});




app.use('/api/users', userRoutes);
app.use('/api/session', sessionRoutes);

app.use('/api/private', protectedRoutes);




app.use((req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ message: 'Ruta no encontrada' });
  }

  return res.status(404).render('404', { title: 'Página no encontrada' });
});


app.use(errorMW);

module.exports = app;






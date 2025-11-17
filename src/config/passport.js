// src/config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        // Normalizar email
        email = email.toLowerCase().trim();

        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: 'Credenciales inválidas' });
        }

            const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: 'Credenciales inválidas' });
        }

    
        return done(null, user);

      } catch (err) {
        return done(err);
      }
    }
  )
);


passport.serializeUser((user, done) => {
  done(null, user._id); 
});


passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) return done(null, false);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});

module.exports = passport;


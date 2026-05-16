const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const user = await User.findByEmail(normalizedEmail);

        if (!user) {
          return done(null, false, { message: 'Невірний email або пароль' });
        }

        const storedHash = user.password || user.passwordHash;
        if (!storedHash) {
          return done(null, false, { message: 'Невірний email або пароль' });
        }

        const normalizedPassword = String(password || '').trim();
        const isValidPassword = await bcrypt.compare(normalizedPassword, storedHash);

        if (!isValidPassword) {
          return done(null, false, { message: 'Невірний email або пароль' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;

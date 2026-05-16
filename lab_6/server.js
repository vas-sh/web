const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const csrf = require('csurf');
const passport = require('./config/passport');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'very-secret-session-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 2
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(csrf());

app.use(express.static('public'));

app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

app.use((error, req, res, next) => {
  if (error.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      error: 'Недійсний CSRF токен'
    });
  }

  return res.status(500).json({
    error: error.message
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}`);
});
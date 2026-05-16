const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('../config/passport');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

const allowedRoles = ['it_operator', 'energy_specialist', 'dc_manager'];

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Забагато спроб входу. Спробуйте пізніше.'
  }
});

router.get('/csrf-token', (req, res) => {
  res.json({
    csrfToken: req.csrfToken()
  });
});

router.post(
  '/register',
  body('name').notEmpty().trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).trim(),
  body('role').isIn(allowedRoles),

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    try {
      const { name, role } = req.body;
      const email = String(req.body.email || '').trim().toLowerCase();
      const password = String(req.body.password || '').trim();

      const existingUser = await User.findByEmail(email);

      if (existingUser) {
        return res.status(400).json({
          error: 'Користувач з таким email вже існує'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role
      });

      res.status(201).json({
        message: 'Реєстрація успішна',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
);

router.post('/login', loginLimiter, (req, res, next) => {
  req.body.email = String(req.body.email || '').trim().toLowerCase();
  req.body.password = String(req.body.password || '').trim();

  passport.authenticate('local', (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.status(401).json({
        error: info?.message || 'Помилка входу'
      });
    }

    req.session.regenerate((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      req.login(user, (loginError) => {
        if (loginError) {
          return next(loginError);
        }

        return res.json({
          message: 'Вхід успішний',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          csrfToken: req.csrfToken()
        });
      });
    });
  })(req, res, next);
});

router.post('/logout', (req, res) => {
  req.logout((error) => {
    if (error) {
      return res.status(500).json({
        error: error.message
      });
    }

    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({
        message: 'Вихід успішний'
      });
    });
  });
});

router.get('/status', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.json({
      authenticated: false
    });
  }

  res.json({
    authenticated: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    },
    csrfToken: req.csrfToken()
  });
});

module.exports = router;

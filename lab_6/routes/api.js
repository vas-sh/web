const express = require('express');
const { body, validationResult } = require('express-validator');
const { isAuthenticated, hasRole } = require('../middleware/auth');

const router = express.Router();

router.get('/datacenter/pue', isAuthenticated, (req, res) => {
  res.json({
    object: 'Дата-центр з PUE моніторингом',
    pue: 1.42,
    dcie: 70.4,
    serverLoad: 68,
    coolingLoad: 31,
    totalPower: 820,
    timestamp: new Date().toISOString()
  });
});

router.post(
  '/servers/load-balance',
  hasRole('it_operator'),
  body('targetLoad').isFloat({ min: 0, max: 100 }),

  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    res.json({
      message: 'Навантаження серверів збалансовано',
      targetLoad: req.body.targetLoad,
      changedBy: req.user.email,
      timestamp: new Date().toISOString()
    });
  }
);

router.post(
  '/cooling/optimize',
  hasRole('energy_specialist'),
  body('coolingMode').isIn(['eco', 'normal', 'boost']),

  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    res.json({
      message: 'Систему охолодження оптимізовано',
      coolingMode: req.body.coolingMode,
      changedBy: req.user.email,
      timestamp: new Date().toISOString()
    });
  }
);

router.get('/efficiency/reports', hasRole('dc_manager'), (req, res) => {
  res.json({
    report: 'Звіт енергоефективності дата-центру',
    averagePue: 1.45,
    averageDcie: 69.1,
    monthlyEnergyCost: 124000,
    recommendation: 'Зменшити навантаження систем охолодження у нічний період',
    generatedFor: req.user.email,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
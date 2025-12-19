const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getReferralTree,
  getCommissions,
  getReferralStats
} = require('../controllers/referralController');

// All routes are protected
router.get('/tree', protect, getReferralTree);
router.get('/commissions', protect, getCommissions);
router.get('/stats', protect, getReferralStats);

module.exports = router;

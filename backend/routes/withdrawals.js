const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { withdrawalValidation, validate } = require('../middleware/validator');
const {
  requestWithdrawal,
  getUserWithdrawals,
  checkEligibility,
  cancelWithdrawal
} = require('../controllers/withdrawalController');

// All routes are protected
router.post('/request', protect, withdrawalValidation, validate, requestWithdrawal);
router.get('/user', protect, getUserWithdrawals);
router.get('/check-eligibility', protect, checkEligibility);
router.delete('/:id', protect, cancelWithdrawal);

module.exports = router;

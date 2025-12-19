const { body, validationResult } = require('express-validator');

// Handle validation errors
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Registration validation rules
exports.registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),
  
  body('referralCode')
    .optional()
    .trim()
];

// Login validation rules
exports.loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Investment validation rules
exports.investmentValidation = [
  body('planId')
    .notEmpty()
    .withMessage('Plan ID is required')
    .isMongoId()
    .withMessage('Invalid plan ID'),
  
  body('amount')
    .isFloat({ min: 5 })
    .withMessage('Minimum investment amount is $5')
];

// Withdrawal validation rules
exports.withdrawalValidation = [
  body('amount')
    .isFloat({ min: 5 })
    .withMessage('Minimum withdrawal amount is $5'),
  
  body('walletAddress')
    .trim()
    .notEmpty()
    .withMessage('Wallet address is required')
];

// Deposit validation rules
exports.depositValidation = [
  body('amount')
    .isFloat({ min: 5 })
    .withMessage('Minimum deposit amount is $5'),
  
  body('transactionHash')
    .optional()
    .trim(),
  
  body('paymentMethod')
    .optional()
    .isIn(['crypto', 'bank', 'card', 'other'])
    .withMessage('Invalid payment method')
];

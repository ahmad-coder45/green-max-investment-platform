const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  investmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment',
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  percentage: {
    type: Number,
    required: true
  },
  investmentAmount: {
    type: Number,
    required: true
  },
  commissionAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'paid'
  },
  transactionId: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate transaction ID
commissionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = 'COM' + Date.now() + Math.random().toString(36).substring(2, 9).toUpperCase();
  }
  next();
});

// Calculate commission based on level
commissionSchema.statics.calculateCommission = function(level, amount) {
  const rates = {
    1: 0.12, // 12%
    2: 0.02, // 2%
    3: 0.01  // 1%
  };
  
  return amount * (rates[level] || 0);
};

module.exports = mongoose.model('Commission', commissionSchema);

const User = require('../models/User');
const Commission = require('../models/Commission');
const Investment = require('../models/Investment');

// @desc    Get referral tree
// @route   GET /api/referrals/tree
// @access  Private
exports.getReferralTree = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get direct referrals (Level 1)
    const level1 = await User.find({ referredBy: userId })
      .select('username email fullName createdAt directSales totalEarnings')
      .populate('directReferrals', 'username email');

    // Get Level 2 referrals
    const level1Ids = level1.map(user => user._id);
    const level2 = await User.find({ referredBy: { $in: level1Ids } })
      .select('username email fullName createdAt referredBy');

    // Get Level 3 referrals
    const level2Ids = level2.map(user => user._id);
    const level3 = await User.find({ referredBy: { $in: level2Ids } })
      .select('username email fullName createdAt referredBy');

    // Build tree structure
    const tree = {
      level1: level1.map(user => ({
        ...user.toObject(),
        level: 1,
        children: level2.filter(l2 => l2.referredBy.toString() === user._id.toString())
      })),
      level2: level2.map(user => ({
        ...user.toObject(),
        level: 2,
        children: level3.filter(l3 => l3.referredBy.toString() === user._id.toString())
      })),
      level3: level3.map(user => ({
        ...user.toObject(),
        level: 3
      }))
    };

    const stats = {
      totalReferrals: level1.length + level2.length + level3.length,
      level1Count: level1.length,
      level2Count: level2.length,
      level3Count: level3.length
    };

    res.json({
      status: 'success',
      data: { tree, stats }
    });
  } catch (error) {
    console.error('Get referral tree error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch referral tree',
      error: error.message
    });
  }
};

// @desc    Get commission history
// @route   GET /api/referrals/commissions
// @access  Private
exports.getCommissions = async (req, res) => {
  try {
    const commissions = await Commission.find({ userId: req.user.id })
      .populate('fromUserId', 'username email fullName')
      .populate('investmentId', 'amount transactionId')
      .sort({ createdAt: -1 });

    const stats = {
      total: commissions.length,
      totalEarned: commissions.reduce((sum, c) => sum + c.commissionAmount, 0),
      level1Earnings: commissions.filter(c => c.level === 1).reduce((sum, c) => sum + c.commissionAmount, 0),
      level2Earnings: commissions.filter(c => c.level === 2).reduce((sum, c) => sum + c.commissionAmount, 0),
      level3Earnings: commissions.filter(c => c.level === 3).reduce((sum, c) => sum + c.commissionAmount, 0)
    };

    res.json({
      status: 'success',
      data: { commissions, stats }
    });
  } catch (error) {
    console.error('Get commissions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch commissions',
      error: error.message
    });
  }
};

// @desc    Get referral stats
// @route   GET /api/referrals/stats
// @access  Private
exports.getReferralStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Get active referrals with investments
    const activeReferrals = await Investment.aggregate([
      {
        $match: {
          userId: { $in: user.directReferrals },
          status: 'active'
        }
      },
      {
        $group: {
          _id: '$userId',
          totalInvested: { $sum: '$amount' }
        }
      }
    ]);

    const stats = {
      referralCode: user.referralCode,
      totalReferrals: user.directReferrals.length,
      activeReferrals: activeReferrals.length,
      totalReferralEarnings: user.totalReferralEarnings,
      directSales: user.directSales,
      weeklySalary: user.weeklySalary,
      referralLink: `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`
    };

    res.json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch referral stats',
      error: error.message
    });
  }
};

module.exports = exports;

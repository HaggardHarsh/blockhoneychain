const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'PERFECT_SCORES',
      'CROSS_BATCH_DEVIATION',
      'PLATFORM_DEVIATION',
      'LAB_BIAS',
      'GEO_FLORAL_MISMATCH',
      'HARVEST_DISTANCE',
      'SEASON_MISMATCH'
    ]
  },
  description: { type: String, required: true },
  weight: { type: Number, required: true, min: 0, max: 100 }
}, { _id: false });

const fraudAlertSchema = new mongoose.Schema({
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HoneyBatch',
    required: true
  },
  qualityTest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QualityTest',
    default: null
  },
  beekeeper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beekeeper',
    required: true
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    required: true
  },
  flags: [flagSchema],
  status: {
    type: String,
    enum: ['OPEN', 'REVIEWING', 'DISMISSED', 'CONFIRMED', 'DISPUTED', 'SUSPENSION_CONFIRMED', 'CLEARED'],
    default: 'OPEN'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  // Dispute fields
  disputeReason: {
    type: String,
    default: null
  },
  disputeEvidence: {
    type: String,
    default: null
  },
  disputeDate: {
    type: Date,
    default: null
  },
  finalDecision: {
    type: String,
    enum: ['SUSPENDED', 'CLEARED', null],
    default: null
  },
  finalDecisionDate: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Calculate severity from risk score
fraudAlertSchema.statics.getSeverity = function(riskScore) {
  if (riskScore >= 76) return 'CRITICAL';
  if (riskScore >= 51) return 'HIGH';
  if (riskScore >= 26) return 'MEDIUM';
  return 'LOW';
};

module.exports = mongoose.model('FraudAlert', fraudAlertSchema);

const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedByRole: { type: String },
  notes: { type: String, default: '' },
  txHash: { type: String, default: null }
}, { _id: false });

const honeyBatchSchema = new mongoose.Schema({
  batchCode: {
    type: String,
    required: [true, 'Batch code is required'],
    unique: true,
    trim: true
  },
  beekeeper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beekeeper',
    required: true
  },
  hives: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hive'
  }],
  floralSource: {
    type: String,
    required: [true, 'Floral source is required']
  },
  harvestDate: {
    type: Date,
    required: [true, 'Harvest date is required']
  },
  rawQuantityKg: {
    type: Number,
    required: [true, 'Raw quantity is required'],
    min: 0.1
  },
  processedQuantityKg: {
    type: Number,
    default: null
  },
  extractionMethod: {
    type: String,
    enum: ['MANUAL', 'CENTRIFUGAL', 'CRUSH_STRAIN'],
    default: 'CENTRIFUGAL'
  },
  status: {
    type: String,
    enum: [
      'HARVESTED',
      'SUBMITTED_FOR_TEST',
      'TESTING',
      'CERTIFIED',
      'REJECTED',
      'PACKAGED',
      'DISPATCHED',
      'DELIVERED'
    ],
    default: 'HARVESTED'
  },
  qualityTest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QualityTest',
    default: null
  },
  // Blockchain
  blockchainTxHash: {
    type: String,
    default: null
  },
  blockchainBatchId: {
    type: Number,
    default: null
  },
  // QR Code
  qrCodeUrl: {
    type: String,
    default: null
  },
  verificationUrl: {
    type: String,
    default: null
  },
  // Tracking history
  statusHistory: [statusHistorySchema],
  // Harvest proof fields
  harvestProofImage: {
    type: String,
    default: null
  },
  harvestLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Generate batch code before validation
honeyBatchSchema.pre('validate', async function(next) {
  if (!this.batchCode) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('HoneyBatch').countDocuments() + 1;
    this.batchCode = `HB-${year}-${month}-${String(count).padStart(4, '0')}`;
  }
  next();
});

// Valid status transitions
honeyBatchSchema.methods.canTransitionTo = function(newStatus) {
  const transitions = {
    'HARVESTED': ['SUBMITTED_FOR_TEST'],
    'SUBMITTED_FOR_TEST': ['TESTING'],
    'TESTING': ['CERTIFIED', 'REJECTED'],
    'CERTIFIED': ['PACKAGED'],
    'REJECTED': ['SUBMITTED_FOR_TEST'], // Re-submit after fixing
    'PACKAGED': ['DISPATCHED'],
    'DISPATCHED': ['DELIVERED']
  };
  return transitions[this.status]?.includes(newStatus) || false;
};

module.exports = mongoose.model('HoneyBatch', honeyBatchSchema);

const mongoose = require('mongoose');

const beekeeperSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  kvicRegistrationId: {
    type: String,
    required: [true, 'KVIC Registration ID is required'],
    unique: true,
    trim: true
  },
  aadhaarLast4: {
    type: String,
    required: [true, 'Last 4 digits of Aadhaar are required'],
    minlength: 4,
    maxlength: 4
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    village: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  numberOfBeeBoxes: {
    type: Number,
    required: [true, 'Number of bee boxes is required'],
    min: 1
  },
  floralSources: {
    type: [String],
    default: ['Multifloral']
  },
  bankDetails: {
    accountNumber: { type: String },
    ifscCode: { type: String },
    bankName: { type: String }
  },
  profilePhoto: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'FLAGGED'],
    default: 'PENDING'
  },
  rejectionReason: {
    type: String,
    default: null
  },
  blockchainId: {
    type: Number,
    default: null
  },
  blockchainTxHash: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for geospatial queries
beekeeperSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Beekeeper', beekeeperSchema);

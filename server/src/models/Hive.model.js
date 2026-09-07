const mongoose = require('mongoose');

const hiveSchema = new mongoose.Schema({
  beekeeper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beekeeper',
    required: true
  },
  hiveCode: {
    type: String,
    required: [true, 'Hive code is required'],
    unique: true,
    trim: true
  },
  location: {
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
  locationName: {
    type: String,
    default: ''
  },
  floralSource: {
    type: String,
    required: [true, 'Floral source is required'],
    default: 'Multifloral'
  },
  installDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'LOST'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

hiveSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hive', hiveSchema);

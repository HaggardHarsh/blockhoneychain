const mongoose = require('mongoose');

const parameterSchema = new mongoose.Schema({
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  unit: { type: String, default: '' },
  limit: { type: String, default: '' },
  pass: { type: Boolean, required: true }
}, { _id: false });

const qualityTestSchema = new mongoose.Schema({
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'HoneyBatch', required: true },
  testedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  labName: { type: String, required: true, trim: true },
  testDate: { type: Date, default: Date.now },
  reportNumber: { type: String, required: true, trim: true },
  parameters: {
    reducingSugar: { type: parameterSchema, default: () => ({ value: 0, unit: '%', limit: '≥ 65%', pass: false }) },
    sucrose: { type: parameterSchema, default: () => ({ value: 0, unit: '%', limit: '≤ 5%', pass: false }) },
    moisture: { type: parameterSchema, default: () => ({ value: 0, unit: '%', limit: '≤ 20%', pass: false }) },
    ash: { type: parameterSchema, default: () => ({ value: 0, unit: '%', limit: '≤ 0.50%', pass: false }) },
    fiehesTest: { type: parameterSchema, default: () => ({ value: 'Negative', unit: '', limit: 'Negative', pass: true }) },
    hmf: { type: parameterSchema, default: () => ({ value: 0, unit: 'mg/kg', limit: '≤ 80 mg/kg', pass: false }) },
    fgRatio: { type: parameterSchema, default: () => ({ value: 0, unit: '', limit: '0.95-1.50', pass: false }) },
    specificGravity: { type: parameterSchema, default: () => ({ value: 0, unit: '', limit: '≥ 1.35', pass: false }) },
    acidity: { type: parameterSchema, default: () => ({ value: 0, unit: '%', limit: '≤ 0.20%', pass: false }) },
    proline: { type: parameterSchema, default: () => ({ value: 0, unit: 'mg/kg', limit: '≥ 180 mg/kg', pass: false }) }
  },
  overallResult: { type: String, enum: ['PASS', 'FAIL'], required: true },
  remarks: { type: String, default: '' },
  labReportIpfsHash: { type: String, default: null },
  labReportUrl: { type: String, default: null },
  blockchainTxHash: { type: String, default: null }, // Hash from HoneyBatch.certifyBatch
  certificationTxHash: { type: String, default: null }, // Hash from QualityCertification.submitCertification
  labReportImage: { type: String, default: null }
}, { timestamps: true });

qualityTestSchema.methods.calculateOverallResult = function() {
  const params = this.parameters;
  const allPass = [
    params.reducingSugar?.pass, params.sucrose?.pass, params.moisture?.pass,
    params.ash?.pass, params.fiehesTest?.pass, params.hmf?.pass,
    params.fgRatio?.pass, params.specificGravity?.pass, params.acidity?.pass,
    params.proline?.pass
  ].every(v => v === true);
  return allPass ? 'PASS' : 'FAIL';
};

module.exports = mongoose.model('QualityTest', qualityTestSchema);

const mongoose = require('mongoose');
const QualityTest = require('../models/QualityTest.model');
const HoneyBatch = require('../models/HoneyBatch.model');

/**
 * Floral source to valid states mapping (India)
 * This is a basic implementation that can be expanded.
 */
const FLORAL_REGIONS = {
  'Mustard': ['UP', 'RJ', 'MP', 'HR', 'PB', 'Uttar Pradesh', 'Rajasthan', 'Madhya Pradesh', 'Haryana', 'Punjab'],
  'Litchi': ['BR', 'UP', 'JH', 'WB', 'Bihar', 'Uttar Pradesh', 'Jharkhand', 'West Bengal'],
  'Jamun': ['MH', 'GJ', 'RJ', 'KA', 'UP', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Karnataka', 'Uttar Pradesh'],
  'Multifloral': ['ALL'], // Can grow anywhere
  'Eucalyptus': ['TN', 'KA', 'AP', 'KL', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Kerala'],
  'Sunflower': ['KA', 'MH', 'AP', 'TN', 'Karnataka', 'Maharashtra', 'Andhra Pradesh', 'Tamil Nadu'],
  'Ajwain': ['RJ', 'GJ', 'MP', 'Rajasthan', 'Gujarat', 'Madhya Pradesh'],
  'Acacia': ['RJ', 'GJ', 'HR', 'Rajasthan', 'Gujarat', 'Haryana']
};

/**
 * Floral source flowering months (1 = Jan, 12 = Dec)
 */
const FLORAL_SEASONS = {
  'Mustard': [11, 12, 1, 2, 3],
  'Litchi': [4, 5, 6],
  'Jamun': [5, 6, 7],
  'Multifloral': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  'Eucalyptus': [1, 2, 3, 4],
  'Sunflower': [1, 2, 3, 4],
  'Ajwain': [2, 3, 4],
  'Acacia': [3, 4, 5]
};

/**
 * Main analysis function
 * @param {Object} batch - The HoneyBatch document
 * @param {Object} qualityTest - The QualityTest document (can be null for pre-test geo checks)
 * @param {Object} beekeeper - The Beekeeper document
 * @returns {Object} - { riskScore, flags }
 */
async function analyzeBatch(batch, qualityTest, beekeeper) {
  let riskScore = 0;
  const flags = [];

  // 1. GEO MISMATCH & SEASONALITY CHECKS
  const floralSource = batch.floralSource;
  const harvestLocation = batch.harvestLocation?.coordinates;
  const beekeeperState = beekeeper?.address?.state;
  const harvestMonth = new Date(batch.harvestDate).getMonth() + 1; // 1-12

  // A. Seasonality Check
  const validMonths = FLORAL_SEASONS[floralSource];
  if (validMonths && !validMonths.includes(harvestMonth)) {
    flags.push({
      type: 'SEASON_MISMATCH',
      description: `${floralSource} is typically not harvested in month ${harvestMonth}. Expected: ${validMonths.join(',')}`,
      weight: 30
    });
    riskScore += 30;
  }

  // B. Geo-Floral Check (checking state instead of raw coords for simplicity, but could use geocoding)
  if (floralSource !== 'Multifloral' && beekeeperState) {
    const validStates = FLORAL_REGIONS[floralSource] || [];
    if (validStates.length > 0 && !validStates.includes('ALL') && !validStates.includes(beekeeperState)) {
      flags.push({
        type: 'GEO_FLORAL_MISMATCH',
        description: `${floralSource} honey is not typically produced in ${beekeeperState}.`,
        weight: 40
      });
      riskScore += 40;
    }
  }

  // C. Distance Check (if GPS is provided and != [0,0])
  if (harvestLocation && harvestLocation.length === 2 && (harvestLocation[0] !== 0 || harvestLocation[1] !== 0)) {
    const bkLocation = beekeeper?.location?.coordinates;
    if (bkLocation && bkLocation.length === 2 && (bkLocation[0] !== 0 || bkLocation[1] !== 0)) {
      const distanceKm = calculateDistance(harvestLocation[1], harvestLocation[0], bkLocation[1], bkLocation[0]);
      
      if (distanceKm > 100) {
        flags.push({
          type: 'HARVEST_DISTANCE',
          description: `Harvest GPS is ${Math.round(distanceKm)}km away from beekeeper's registered location (>100km threshold).`,
          weight: 25
        });
        riskScore += 25;
      }
    }
  }

  // 2. QUALITY TEST ANOMALIES
  if (qualityTest && qualityTest.parameters) {
    const p = qualityTest.parameters;

    // A. Perfect Score Detection
    // If all key parameters are suspiciously exactly in the middle of standard ranges
    // Or if they always pass with the exact same values across batches (placeholder logic)
    const isSuspiciouslyPerfect = checkPerfectScores(p);
    if (isSuspiciouslyPerfect) {
      flags.push({
        type: 'PERFECT_SCORES',
        description: 'Test results exhibit statistically improbable "perfect" values across all parameters.',
        weight: 35
      });
      riskScore += 35;
    }

    // B. Lab Bias / Collusion Detection
    const labName = qualityTest.labName;
    if (labName) {
      const biasData = await checkLabBias(labName);
      if (biasData.isBiased) {
        flags.push({
          type: 'LAB_BIAS',
          description: `Lab '${labName}' has a ${biasData.passRate}% pass rate across ${biasData.totalTests} tests (Highly unusual).`,
          weight: 20
        });
        riskScore += 20;
      }
    }

    // C. Cross-Batch Deviation
    const deviationData = await checkCrossBatchDeviation(beekeeper._id, floralSource, p, qualityTest._id);
    if (deviationData.isAnomalous) {
      flags.push({
        type: 'CROSS_BATCH_DEVIATION',
        description: `Moisture/HMF values deviate significantly from this beekeeper's historical average for ${floralSource}.`,
        weight: 25
      });
      riskScore += 25;
    }
  }

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);

  return { riskScore, flags };
}

/**
 * Helper to calculate distance between two lat/lon coordinates in km
 * Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

/**
 * Detects if scores are "too perfect" (e.g., all exactly at minimums/maximums or fake-looking)
 */
function checkPerfectScores(params) {
  // Simple heuristic: if moisture is exactly 18.00, HMF exactly 20.00, sucrose exactly 2.00, etc.
  // In a real app, this would use standard deviation bounds.
  // For SIH demo: we flag if 3 or more values end in exactly .00 or are suspiciously round
  let roundNumbers = 0;
  
  if (params.moisture?.value && params.moisture.value % 1 === 0) roundNumbers++;
  if (params.hmf?.value && params.hmf.value % 1 === 0) roundNumbers++;
  if (params.sucrose?.value && params.sucrose.value % 1 === 0) roundNumbers++;
  if (params.reducingSugar?.value && params.reducingSugar.value % 1 === 0) roundNumbers++;
  
  return roundNumbers >= 3;
}

/**
 * Checks if a lab passes too many batches
 */
async function checkLabBias(labName) {
  // Aggregate lab stats
  const stats = await QualityTest.aggregate([
    { $match: { labName } },
    { $group: {
      _id: null,
      total: { $sum: 1 },
      passes: { $sum: { $cond: [{ $eq: ['$overallResult', 'PASS'] }, 1, 0] } }
    }}
  ]);

  if (!stats || stats.length === 0) return { isBiased: false };
  
  const totalTests = stats[0].total;
  const passRate = Math.round((stats[0].passes / totalTests) * 100);

  // Flag if a lab has done more than 5 tests and has a 100% pass rate
  if (totalTests >= 5 && passRate === 100) {
    return { isBiased: true, passRate, totalTests };
  }
  
  return { isBiased: false, passRate, totalTests };
}

/**
 * Checks if current test deviates from beekeeper's historical average
 */
async function checkCrossBatchDeviation(beekeeperId, floralSource, currentParams, currentTestId) {
  // Find past batches from this beekeeper for the same floral source
  const pastBatches = await HoneyBatch.find({ 
    beekeeper: beekeeperId,
    floralSource,
    qualityTest: { $ne: null, $ne: currentTestId }
  }).populate('qualityTest');

  if (pastBatches.length < 2) return { isAnomalous: false }; // Need at least 2 past tests for a baseline

  let sumMoisture = 0, sumHmf = 0, count = 0;
  
  for (const b of pastBatches) {
    if (b.qualityTest && b.qualityTest.parameters) {
      if (b.qualityTest.parameters.moisture?.value) sumMoisture += b.qualityTest.parameters.moisture.value;
      if (b.qualityTest.parameters.hmf?.value) sumHmf += b.qualityTest.parameters.hmf.value;
      count++;
    }
  }

  if (count === 0) return { isAnomalous: false };

  const avgMoisture = sumMoisture / count;
  const avgHmf = sumHmf / count;

  const currentMoisture = currentParams.moisture?.value || 0;
  const currentHmf = currentParams.hmf?.value || 0;

  // Anomaly if it deviates by more than 30% from their personal average
  const moistureDev = Math.abs(currentMoisture - avgMoisture) / avgMoisture;
  const hmfDev = Math.abs(currentHmf - avgHmf) / avgHmf;

  if (moistureDev > 0.30 || hmfDev > 0.30) {
    return { isAnomalous: true };
  }

  return { isAnomalous: false };
}

module.exports = {
  analyzeBatch
};

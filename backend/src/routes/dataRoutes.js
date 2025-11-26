// backend/src/routes/dataRoutes.js
const express = require('express');
const multer = require('multer');
const Record = require('../models/Record');
const { parseExcelBuffer } = require('../utils/excelParser');
const { fitOLS, predict } = require('../lib/ols'); // Import OLS functions
const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  }
});

// Add request validation middleware
const validateUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  next();
};

// Function to analyze soil data using OLS and generate predictions/insights
async function analyzeSoilData(records) {
  if (!records || records.length === 0) {
    return { updatedRecords: [], insights: [], predictedYield: null };
  }

  // Prepare data for OLS: Features (pH, moisture, nitrogen, phosphorus, potassium, temperature) -> Target (observed_yield)
  const features = ['ph', 'moisture', 'nitrogen', 'phosphorus', 'potassium', 'temperature_c'];
  const X = records.map(record => features.map(feat => record[feat] || 0));
  const y = records.map(record => record.observed_yield || 0);

  // Fit OLS model
  const coefficients = fitOLS(X, y);

  // Ideal NPK values (example thresholds for recommendations; adjust as needed)
  const idealNPK = { nitrogen: 50, phosphorus: 25, potassium: 150 };

  const updatedRecords = records.map(record => {
    const featureValues = features.map(feat => record[feat] || 0);
    const predictedYield = predict(coefficients, featureValues);

    // Calculate fertilizer recommendations based on deficits
    const fertilizerRecs = [];
    if (record.nitrogen < idealNPK.nitrogen) {
      fertilizerRecs.push(`Add ${(idealNPK.nitrogen - record.nitrogen).toFixed(1)} kg N/ha`);
    }
    if (record.phosphorus < idealNPK.phosphorus) {
      fertilizerRecs.push(`Add ${(idealNPK.phosphorus - record.phosphorus).toFixed(1)} kg P/ha`);
    }
    if (record.potassium < idealNPK.potassium) {
      fertilizerRecs.push(`Add ${(idealNPK.potassium - record.potassium).toFixed(1)} kg K/ha`);
    }
    const recommendedFertilizer = fertilizerRecs.length > 0 ? fertilizerRecs.join(', ') : 'No additional fertilizer needed';

    // Forge LLM-like text insights
    const llmText = `Analysis for ${record.location}: Predicted yield is ${predictedYield.toFixed(0)} kg/ha based on soil conditions (pH: ${record.ph}, moisture: ${record.moisture}%). ${recommendedFertilizer}. Consider irrigation if moisture < 30%.`;

    return {
      ...record.toObject(),
      predicted_yield: predictedYield,
      recommended_fertilizer_kg_per_ha: recommendedFertilizer,
      llm_text: llmText
    };
  });

  // Overall insights (forged summary)
  const avgPredictedYield = updatedRecords.reduce((sum, r) => sum + r.predicted_yield, 0) / updatedRecords.length;
  const insights = [
    `Average predicted yield: ${avgPredictedYield.toFixed(0)} kg/ha.`,
    `Fields with low pH (<6) may need liming.`,
    `Monitor nitrogen levels closely for optimal growth.`
  ];

  return {
    updatedRecords,
    insights,
    predictedYield: avgPredictedYield
  };
}

// Enhanced upload endpoint with better error handling
router.post('/upload', upload.single('file'), validateUpload, async (req, res) => {
  try {
    console.log('📊 Processing uploaded file...');
    
    const rows = parseExcelBuffer(req.file.buffer);
    
    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: 'No valid data found in Excel file' });
    }

    // Save records to database
    const savedRecords = await Promise.all(
      rows.map(async (row) => {
        const record = new Record({
          ...row,
          timestamp: new Date() // Add timestamp if not present
        });
        return await record.save();
      })
    );

    console.log(`✅ Saved ${savedRecords.length} records to database`);

    // Process with OLS algorithm
    const allRecords = await Record.find({});
    const analysisResult = await analyzeSoilData(allRecords);

    res.json({
      message: `Successfully processed ${savedRecords.length} records`,
      records: analysisResult.updatedRecords,
      insights: analysisResult.insights,
      predictedYield: analysisResult.predictedYield
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ 
      error: 'Failed to process file',
      details: err.message 
    });
  }
});

// Add a new endpoint for manual data entry (for testing without Excel)
router.post('/manual-entry', async (req, res) => {
  try {
    const { 
      location, ph, moisture, nitrogen, phosphorus, potassium, temperature_c, observed_yield 
    } = req.body;

    const newRecord = new Record({
      timestamp: new Date(),
      location,
      ph: parseFloat(ph),
      moisture: parseFloat(moisture),
      nitrogen: parseFloat(nitrogen),
      phosphorus: parseFloat(phosphorus),
      potassium: parseFloat(potassium),
      temperature_c: parseFloat(temperature_c),
      observed_yield: parseFloat(observed_yield)
    });

    await newRecord.save();
    
    // Process with OLS model
    const allRecords = await Record.find({});
    const analysis = await analyzeSoilData(allRecords);
    
    res.json({
      message: 'Manual entry successful',
      record: analysis.updatedRecords.find(r => r._id.equals(newRecord._id)) || newRecord
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a GET endpoint to fetch all records (for frontend display)
router.get('/records', async (req, res) => {
  try {
    const records = await Record.find({});
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
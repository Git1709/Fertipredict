const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
  timestamp: Date,
  location: String,
  ph: Number,
  moisture: Number,
  nitrogen: Number,
  phosphorus: Number,
  potassium: Number,
  temperature_c: Number,
  observed_yield: Number,
  predicted_yield: Number,
  recommended_fertilizer_kg_per_ha: Number,
  llm_text: String
});

module.exports = mongoose.model('Record', RecordSchema);
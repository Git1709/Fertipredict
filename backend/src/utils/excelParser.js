// backend/src/utils/excelParser.js
const xlsx = require("xlsx");

function toNum(value) {
  if (value === undefined || value === null) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function parseExcelBuffer(buffer) {
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  // Map CSV fields to your database schema
  return data.map(row => ({
    timestamp: row.timestamp ? new Date(row.timestamp) : new Date(),
    location: String(row.location || `Plot-${Math.random().toString(36).substr(2, 4)}`),
    ph: toNum(row.ph),
    moisture: toNum(row.moisture),
    nitrogen: toNum(row.nitrogen),
    phosphorus: toNum(row.phosphorus),
    potassium: toNum(row.potassium),
    temperature_c: toNum(row.temperature_c),
    observed_yield: toNum(row.observed_yield)
  }));
}

module.exports = { parseExcelBuffer };
import React from 'react'

const RecordsTable = ({ records }) => {
  if (!records || records.length === 0) {
    return <div className="no-data">No records available</div>
  }

  return (
    <div className="records-table-container">
      <div className="table-wrapper">
        <table className="records-table">
          <thead>
            <tr>
              <th>Location</th>
              <th>pH</th>
              <th>Moisture</th>
              <th>N</th>
              <th>P</th>
              <th>K</th>
              <th>Temp (°C)</th>
              <th>Predicted Yield</th>
              <th>Fertilizer (kg/ha)</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                <td className="location">{record.location}</td>
                <td className={record.ph < 5.5 || record.ph > 7.5 ? 'warning' : 'normal'}>
                  {record.ph}
                </td>
                <td className={record.moisture < 20 ? 'warning' : 'normal'}>
                  {record.moisture}%
                </td>
                <td className={record.nitrogen < 30 ? 'warning' : 'normal'}>
                  {record.nitrogen} ppm
                </td>
                <td className={record.phosphorus < 15 ? 'warning' : 'normal'}>
                  {record.phosphorus} ppm
                </td>
                <td className={record.potassium < 100 ? 'warning' : 'normal'}>
                  {record.potassium} ppm
                </td>
                <td>{record.temperature_c}°C</td>
                <td className="yield">{record.predicted_yield} kg/ha</td>
                <td className="fertilizer">{record.recommended_fertilizer_kg_per_ha} kg/ha</td>
                <td className="timestamp">
                  {new Date(record.timestamp).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-summary">
        <p>Showing {records.length} field records</p>
      </div>
    </div>
  )
}

export default RecordsTable
import React, { useState, useEffect } from 'react'
import UploadForm from './components/UploadForm'
import RecordsTable from './components/RecordsTable'
import PredictionCard from './components/PredictionCard'
import './styles/index.css'

function App() {
  const [records, setRecords] = useState([])
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(false)

  // Fetch existing records on component mount
  useEffect(() => {
    fetchRecords()
  }, [])
  
const fetchRecords = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/data/records'); // Updated port
    const data = await response.json();
    setRecords(data);
  } catch (error) {
    console.error('Failed to fetch records:', error);
  }
};


  const handleUploadSuccess = (data) => {
    setRecords(data.records)
    setPredictions({
      insights: data.insights || [],
      predictedYield: data.predictedYield
    })
    fetchRecords() // Refresh the records list
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>🌱 Smart Agriculture AI - FertPredict</h1>
          <p>AI-powered fertilizer recommendation and yield prediction system</p>
        </div>
      </header>

      <main className="app-main">
        <section className="upload-section card">
          <h2>Upload Field Data</h2>
          <UploadForm 
            onUploadSuccess={handleUploadSuccess}
            loading={loading}
            setLoading={setLoading}
          />
        </section>

        {predictions && (
          <section className="prediction-section">
            <PredictionCard predictions={predictions} />
          </section>
        )}

        {records.length > 0 && (
          <section className="records-section card">
            <h2>Field Data Analysis</h2>
            <RecordsTable records={records} />
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>FertPredict &copy; 2024 - Smart Agricultural Solutions</p>
      </footer>
    </div>
  )
}

export default App
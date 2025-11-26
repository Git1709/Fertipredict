import React, { useState } from 'react'

const UploadForm = ({ onUploadSuccess, loading, setLoading }) => {
  const [dragActive, setDragActive] = useState(false)

      const handleFileUpload = async (file) => {
       if (!file) return
       
       setLoading(true)
       const formData = new FormData()
       formData.append('file', file)

       try {
         const response = await fetch('http://localhost:5000/api/data/upload', {  // Updated port
           method: 'POST',
           body: formData,
         })

         if (!response.ok) {
           throw new Error(`Upload failed: ${response.statusText}`)
         }

         const data = await response.json()
         onUploadSuccess(data)
         alert(`✅ Successfully processed ${data.records?.length || 0} records!`)
       } catch (error) {
         console.error('Upload error:', error)
         alert(`❌ Upload failed: ${error.message}`)
       } finally {
         setLoading(false)
       }
     }
     

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="upload-form">
      <div 
        className={`drop-zone ${dragActive ? 'active' : ''} ${loading ? 'loading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => handleFileUpload(e.target.files[0])}
          disabled={loading}
          style={{ display: 'none' }}
        />
        <label htmlFor="file-upload" className="upload-label">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <span>Processing your data...</span>
            </div>
          ) : (
            <>
              <div className="upload-icon">📁</div>
              <span className="upload-text">
                Drop your Excel file here or click to browse
              </span>
              <small className="upload-hint">
                Supports .xlsx, .xls, and .csv files with soil data
              </small>
            </>
          )}
        </label>
      </div>

      <div className="sample-data">
        <h4>Expected Excel Format:</h4>
        <div className="format-example">
          <table>
            <thead>
              <tr>
                <th>timestamp</th>
                <th>location</th>
                <th>ph</th>
                <th>moisture</th>
                <th>nitrogen</th>
                <th>phosphorus</th>
                <th>potassium</th>
                <th>temperature_c</th>
                <th>observed_yield</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2025-10-01T08:00:00Z</td>
                <td>Plot-A</td>
                <td>6.5</td>
                <td>25</td>
                <td>45</td>
                <td>20</td>
                <td>130</td>
                <td>24</td>
                <td>3200</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default UploadForm
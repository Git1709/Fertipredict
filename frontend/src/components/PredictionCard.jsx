import React from 'react'

const PredictionCard = ({ predictions }) => {
  if (!predictions) return null

  return (
    <div className="prediction-card card">
      <h2>🌾 AI Analysis & Predictions</h2>
      
      <div className="prediction-grid">
        <div className="prediction-item yield-prediction">
          <h3>Estimated Yield</h3>
          <div className="prediction-value">
            {predictions.predictedYield || 'Calculating...'} kg/ha
          </div>
        </div>

        <div className="prediction-item fertilizer-recommendation">
          <h3>Fertilizer Advice</h3>
          <div className="recommendation-list">
            {predictions.insights && predictions.insights.length > 0 ? (
              predictions.insights.map((insight, index) => (
                <div key={index} className="recommendation-item">
                  • {insight}
                </div>
              ))
            ) : (
              <div className="no-insights">
                Upload data to get fertilizer recommendations
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="llm-analysis">
        <h3>🤖 AI Agricultural Insights</h3>
        <div className="analysis-content">
          {predictions.llmText ? (
            <pre>{predictions.llmText}</pre>
          ) : (
            <p>AI analysis will appear here after data upload...</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default PredictionCard
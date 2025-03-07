import React from 'react';

type SentimentVisualizerProps = {
  sentimentScore: number; // -1 to 1 scale
};

export const SentimentVisualizer: React.FC<SentimentVisualizerProps> = ({ sentimentScore }) => {
  // Normalize the sentiment score to a 0-100 scale for the gauge
  const normalizedScore = ((sentimentScore + 1) / 2) * 100;
  
  // Determine color based on sentiment
  const getColor = () => {
    if (sentimentScore > 0.2) return 'bg-green-500';
    if (sentimentScore < -0.2) return 'bg-red-500';
    return 'bg-yellow-500';
  };
  
  // Get label based on sentiment
  const getLabel = () => {
    if (sentimentScore > 0.5) return 'Very Positive';
    if (sentimentScore > 0.2) return 'Positive';
    if (sentimentScore > -0.2) return 'Neutral';
    if (sentimentScore > -0.5) return 'Negative';
    return 'Very Negative';
  };
  
  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Sentiment Analysis</h2>
      
      <div className="flex flex-col items-center">
        {/* Gauge visualization */}
        <div className="w-full h-6 bg-gray-200 rounded-full mb-2 overflow-hidden">
          <div 
            className={`h-full ${getColor()}`} 
            style={{ width: `${normalizedScore}%` }}
          />
        </div>
        
        {/* Scale labels */}
        <div className="w-full flex justify-between text-xs text-gray-500 mb-4">
          <span>Negative</span>
          <span>Neutral</span>
          <span>Positive</span>
        </div>
        
        {/* Score and label */}
        <div className="text-center">
          <div className="text-3xl font-bold">{getLabel()}</div>
          <div className="text-gray-500">
            Score: {sentimentScore.toFixed(2)} 
            <span className="text-xs ml-1">(-1 to +1 scale)</span>
          </div>
        </div>
        
        {/* Explanation */}
        <div className="mt-4 text-sm text-gray-600">
          <p>
            This sentiment analysis evaluates the emotional tone of your text based on the 
            presence of positive and negative words. A higher score indicates more positive sentiment.
          </p>
        </div>
      </div>
    </div>
  );
}; 
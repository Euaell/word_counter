import React, { useMemo } from 'react';
import { Word } from './WordCloudComponent';
import { analyzeText, TextAnalysisResult } from '@/utils/textProcessing';

type StatisticsPanelProps = {
  words: Word[];
  originalText: string;
};

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ words, originalText }) => {
  // Use the enhanced text analysis
  const analysis: TextAnalysisResult = useMemo(() => {
    return analyzeText(originalText);
  }, [originalText]);
  
  // Format sentiment score as a readable label
  const getSentimentLabel = (score: number): { label: string; color: string } => {
    if (score > 0.2) return { label: 'Positive', color: 'text-green-600' };
    if (score < -0.2) return { label: 'Negative', color: 'text-red-600' };
    return { label: 'Neutral', color: 'text-gray-600' };
  };
  
  // Format readability score as a readable label
  const getReadabilityLabel = (score: number): { label: string; color: string } => {
    if (score > 80) return { label: 'Very Easy', color: 'text-green-600' };
    if (score > 60) return { label: 'Easy', color: 'text-blue-600' };
    if (score > 40) return { label: 'Average', color: 'text-yellow-600' };
    if (score > 20) return { label: 'Difficult', color: 'text-orange-600' };
    return { label: 'Very Difficult', color: 'text-red-600' };
  };
  
  // Format grade level as a readable label
  const getGradeLevelLabel = (level: number): string => {
    if (level <= 1) return 'Kindergarten';
    if (level <= 12) return `Grade ${Math.round(level)}`;
    if (level <= 16) return `College Year ${Math.round(level - 12)}`;
    return 'Graduate Level';
  };
  
  const sentiment = getSentimentLabel(analysis.sentimentScore);
  const readability = getReadabilityLabel(analysis.readability.fleschReadingEase);
  const gradeLevel = getGradeLevelLabel(analysis.readability.fleschKincaidGradeLevel);

  // Stats cards
  const stats = [
    { label: 'Total Words', value: analysis.totalWords },
    { label: 'Unique Words', value: analysis.uniqueWords },
    { label: 'Avg. Word Length', value: analysis.averageWordLength.toFixed(1) + ' chars' },
    { 
      label: 'Sentiment', 
      value: sentiment.label, 
      color: sentiment.color 
    },
    { 
      label: 'Readability', 
      value: readability.label, 
      color: readability.color 
    },
    { 
      label: 'Grade Level', 
      value: gradeLevel,
      tooltip: `Flesch-Kincaid Grade Level: ${analysis.readability.fleschKincaidGradeLevel.toFixed(1)}`
    },
  ];

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Text Analysis</h2>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="bg-blue-50 p-3 rounded-lg relative group" 
            title={stat.tooltip}
          >
            <div className="text-sm text-blue-700">{stat.label}</div>
            <div className={`text-xl font-bold ${stat.color || ''}`}>{stat.value}</div>
          </div>
        ))}
      </div>
      
      {/* Advanced readability metrics */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Readability Details</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Reading Ease:</span>
            <span className="font-medium">{analysis.readability.fleschReadingEase.toFixed(1)}/100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Grade Level:</span>
            <span className="font-medium">{analysis.readability.fleschKincaidGradeLevel.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Average Sentence:</span>
            <span className="font-medium">{analysis.readability.averageSentenceLength.toFixed(1)} words</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Syllables per Word:</span>
            <span className="font-medium">{analysis.readability.averageSyllablesPerWord.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Top words and bigrams */}
      {words.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Top Words</h3>
            <div className="space-y-2">
              {words.slice(0, 5).map((word) => (
                <div key={word.text} className="flex items-center justify-between">
                  <span className="font-medium">{word.text}</span>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">{word.value}</span>
                    <div className="bg-gray-200 h-4 w-24 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full" 
                        style={{ 
                          width: `${(word.value / words[0].value) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Top bigrams */}
          {analysis.topBigrams.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Common Phrases</h3>
              <div className="space-y-2">
                {analysis.topBigrams.slice(0, 5).map((bigram) => (
                  <div key={bigram.text} className="flex items-center justify-between">
                    <span className="font-medium">{bigram.text}</span>
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-2">{bigram.value}</span>
                      <div className="bg-gray-200 h-4 w-24 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500 h-full" 
                          style={{ 
                            width: `${(bigram.value / analysis.topBigrams[0].value) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 
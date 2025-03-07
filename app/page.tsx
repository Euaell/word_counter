'use client';

import React, { useCallback, useMemo, useState, useRef } from 'react';
import { Word, WordCloudComponent } from '@/components/WordCloudComponent';
import { getWordFrequencies, analyzeText } from '@/utils/textProcessing';
import { StatisticsPanel } from '@/components/StatisticsPanel';
import { SentimentVisualizer } from '@/components/SentimentVisualizer';

export default function Home(): React.ReactElement {

	const [textData, setTextData] = React.useState('');
	const [isLoading, setIsLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
		setTextData(event.target.value);
	}

	// Handle file upload
	const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setIsLoading(true);
		try {
			const text = await file.text();
			setTextData(text);
		} catch (error) {
			console.error('Error reading file:', error);
			alert('Error reading file. Please try another file.');
		} finally {
			setIsLoading(false);
		}
	}, []);

	const handleBrowseClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	// Process the text data to get word frequencies and analysis
	const words = useMemo(() => 
		getWordFrequencies(textData, {
			includePercentages: true,
			maxResults: 200, // Increased to allow more words in the cloud
			minWordLength: 2  // Allow shorter words
		}), 
	[textData]);
	
	const textAnalysis = useMemo(() => analyzeText(textData), [textData]);

	const totalWordCount = useMemo(() => {
		return words.reduce((sum: number, word: Word) => sum + word.value, 0);
	}, [words]);

	// Tooltip state
	const [tooltipContent, setTooltipContent] = useState<{ word: string; percentage: number } | null>(null);
	const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
	const [tooltipVisible, setTooltipVisible] = useState(false);
  
	// Event handlers for word mouse over and out
	const onWordMouseOver = useCallback(
		(event: MouseEvent, d: Word) => {
			// Use percentage if available, otherwise calculate it
			const percentage = d.percentage ?? ((d.value / totalWordCount) * 100);
			setTooltipContent({ word: d.text, percentage });
			setTooltipPosition({ x: event.clientX, y: event.clientY });
			setTooltipVisible(true);
		},
		[totalWordCount]
	)
	
	const onWordMouseOut = useCallback(() => {
		setTooltipVisible(false);
	}, [])

	return (
		<div className='p-5 max-w-7xl mx-auto'>
			<h1 className='text-3xl font-bold mb-6'>Word Counter Cloud</h1>

			<div className='flex flex-col lg:flex-row gap-8'>
				{/* Left column - Word Cloud */}
				<div className='w-full lg:w-1/2'>
					<div className='bg-white rounded-lg shadow-md p-4 mb-6'>
						<h2 className='text-xl font-semibold mb-4'>Word Cloud Visualization</h2>
						<div className='h-[450px] relative'>
							{isLoading ? (
								<div className='h-full flex justify-center items-center'>
									<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
								</div>
							) : words && words.length ? (
								<WordCloudComponent
									words={words}
									width={550}
									height={450}
									onWordMouseOver={onWordMouseOver}
									onWordMouseOut={onWordMouseOut}
								/> 
							) : (
								<div className='h-full flex justify-center items-center'>
									<p className='text-amber-500'>No words to display</p>
								</div>
							)}
							{/* Tooltip */}
							{tooltipVisible && tooltipContent && (
								<div
									className="fixed bg-gray-800 text-white text-sm rounded py-1 px-2 z-50 pointer-events-none"
									style={{ top: tooltipPosition.y + 10, left: tooltipPosition.x + 10 }}
								>
									{tooltipContent.word}: {tooltipContent.percentage.toFixed(1)}%
								</div>
							)}
						</div>
					</div>

					{/* Sentiment Visualizer */}
					{words.length > 0 && (
						<SentimentVisualizer sentimentScore={textAnalysis.sentimentScore} />
					)}
				</div>

				{/* Right column - Text input and statistics */}
				<div className='w-full lg:w-1/2'>
					<div className='bg-white rounded-lg shadow-md p-4 mb-6'>
						<h2 className='text-xl font-semibold mb-4'>Text Input</h2>
						<div className='mb-4 flex flex-col gap-2'>
							<div className='flex items-center gap-2'>
								<button 
									onClick={handleBrowseClick}
									className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
								>
									Upload Text File
								</button>
								<input
									type="file"
									ref={fileInputRef}
									onChange={handleFileUpload}
									accept=".txt,.md,.csv"
									className='hidden'
								/>
								{textData && (
									<button 
										onClick={() => setTextData('')}
										className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors'
									>
										Clear
									</button>
								)}
							</div>
							<p className='text-xs text-gray-500'>Supported formats: .txt, .md, .csv</p>
						</div>

						<textarea
							className='w-full h-40 p-3 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500'
							value={textData}
							onChange={handleChange}
							placeholder='Enter your text here or upload a file...'
						/>
					</div>
					
					{/* Statistics Panel */}
					{words.length > 0 && (
						<StatisticsPanel words={words} originalText={textData} />
					)}
				</div>
			</div>

			<div className='mt-8 text-gray-600 text-sm border-t pt-4'>
				<h3 className='font-semibold text-gray-800 mb-2'>How It Works</h3>
				<p className='mb-2'>
					This tool analyzes text to create a visual representation of word frequencies. The size and color of each word in the cloud 
					indicates its frequency in the text. More frequent words appear larger and in warmer colors.
				</p>
				<p>
					The analysis includes readability metrics using the Flesch-Kincaid formulas, sentiment analysis, and identification of common word pairs.
					Upload a text file or paste content to see the analysis in real-time.
				</p>
			</div>
		</div>
	)
}

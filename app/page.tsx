'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Word, WordCloudComponent } from '@/components/WordCloudComponent';
import { getWordFrequencies } from '@/utils/textProcessing';

export default function Home(): React.ReactElement {

	const [textData, setTextData] = React.useState('');

	function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
		setTextData(event.target.value);
	}

	// Process the text data to get word frequencies
	const words = useMemo(() => getWordFrequencies(textData), [textData]);

	const totalWordCount = useMemo(() => {
		return words.reduce((sum, word) => sum + word.value, 0);
	}, [words]);

	// Tooltip state
	const [tooltipContent, setTooltipContent] = useState<{ word: string; percentage: number } | null>(null);
	const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
	const [tooltipVisible, setTooltipVisible] = useState(false);
  
	// Event handlers for word mouse over and out
	const onWordMouseOver = useCallback(
		(event: MouseEvent, d: Word) => {
			if (totalWordCount > 0) {
				const percentage = (d.value / totalWordCount) * 100;
				setTooltipContent({ word: d.text, percentage });
			} else {
				setTooltipContent({ word: d.text, percentage: 0 });
			}
			setTooltipPosition({ x: event.clientX, y: event.clientY });
			setTooltipVisible(true);
		},
		[totalWordCount]
	)
	
	const onWordMouseOut = useCallback(() => {
		setTooltipVisible(false);
	}, [])

	return (
		<div className='p-5'>
			<h1 className='text-3xl font-bold'>Word Counter Cloud</h1>

			<div className='flex flex-col md:flex-row mt-4 justify-around items-center gap-6'>

				<div className='w-full md:w-2/5 h-[350px] md:h-[400px]'>
					{words && words.length ? 
						<WordCloudComponent
							words={words}
							width={350}
							height={400}
							onWordMouseOver={onWordMouseOver}
							onWordMouseOut={onWordMouseOut}
						/> 
						: 
						<div className='h-full flex justify-center items-center'>
							<p className='text-amber-500'>No words to display</p>
						</div>
					}
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

				<div className='w-full md:w-2/5 mt-4 md:mt-0 h-full max-h-full'>
					<textarea
						className='w-full h-32 max-h-full p-2 text-sm text-gray-900 bg-gray-100 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500'
						value={textData}
						onChange={handleChange}
						placeholder='Enter your text here...'
					/>
				</div>
			</div>

			<div className='mt-4 text-gray-500 text-sm md:w-5/12'>
				<p>
					<strong className='text-black'>Instructions:</strong> Change the text data in the textarea to see the word cloud update in real-time.
				</p>

				<p>
					<strong className='text-black'>How it works:</strong> The text data is processed to get word frequencies, which are then visualized in a word cloud. The size of each word in the cloud is determined by its frequency in the text.
				</p>
			</div>
		</div>
	)
}

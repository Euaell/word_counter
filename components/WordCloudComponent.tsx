import React, { forwardRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { WordFrequency } from '@/utils/textProcessing';

const WordCloud = dynamic(() => import('react-d3-cloud'), { ssr: false });

export type Word = WordFrequency;

type Props = {
	words: Word[];
	width: number;
	height: number;
	onWordMouseOver?: (event: MouseEvent, d: Word) => void;
	onWordMouseOut?: (event: MouseEvent, d: Word) => void;
}

const MAX_FONT_SIZE = 72;
const MIN_FONT_SIZE = 8;
const MAX_FONT_WEIGHT = 600;
const MIN_FONT_WEIGHT = 300;
const MAX_WORDS = 30;

const WordCloudComponentInner = forwardRef<HTMLDivElement, Props>(
	({ words, width, height, onWordMouseOut, onWordMouseOver }, ref) => {
		const sortedWords = useMemo(
			() => [...words].sort((a, b) => b.value - a.value).slice(0, MAX_WORDS),
			[words]
		);

		const [minOccurrences, maxOccurrences] = useMemo(() => {
			const values = sortedWords.map((w) => w.value);
			const min = Math.min(...values);
			const max = Math.max(...values);
			return [min, max];
		}, [sortedWords]);

		/**
		 * Calculate font size using a logarithmic or square root scale for more proportional display
		 * This prevents high-frequency words from appearing disproportionately large
		 */
		const calculateFontSize = useCallback(
			(wordOccurrences: number) => {
				// Handle edge cases
				if (maxOccurrences === minOccurrences) return (MIN_FONT_SIZE + MAX_FONT_SIZE) / 2;
				if (sortedWords.length === 1) return MAX_FONT_SIZE;
				
				// Use logarithmic scale for more proportional sizing
				// Log base transformation makes differences less extreme
				const logMin = Math.log(minOccurrences || 1);
				const logMax = Math.log(maxOccurrences);
				const logCurrent = Math.log(wordOccurrences || 1);
				
				// Calculate normalized value in log space
				let normalizedValue;
				if (logMax === logMin) {
					normalizedValue = 0.5; // Fallback if all words have same frequency
				} else {
					normalizedValue = (logCurrent - logMin) / (logMax - logMin);
				}
				
				// Apply square root transformation to further smooth out size differences
				normalizedValue = Math.sqrt(normalizedValue);
				
				// Calculate final font size
				const fontSize = MIN_FONT_SIZE + normalizedValue * (MAX_FONT_SIZE - MIN_FONT_SIZE);
				return Math.round(fontSize);
			},
			[maxOccurrences, minOccurrences, sortedWords]
		);

		// Font weight calculation with smoother scaling
		const calculateFontWeight = useCallback(
			(wordOccurrences: number) => {
				if (maxOccurrences === minOccurrences) return (MAX_FONT_WEIGHT + MIN_FONT_WEIGHT) / 2;
				
				// Use square root scaling for more proportional font weight
				const normalizedValue = Math.sqrt((wordOccurrences - minOccurrences) / 
					(maxOccurrences - minOccurrences || 1));
					
				const fontWeight = MIN_FONT_WEIGHT + normalizedValue * (MAX_FONT_WEIGHT - MIN_FONT_WEIGHT);
				return Math.round(fontWeight);
			},
			[maxOccurrences, minOccurrences]
		);

		// Optional color function based on word frequency
		const colorFunction = useCallback((word: Word) => {
			// Normalize the value using the same logarithmic approach
			const logMin = Math.log(minOccurrences || 1);
			const logMax = Math.log(maxOccurrences);
			const logCurrent = Math.log(word.value || 1);
			
			let normalizedValue;
			if (logMax === logMin) {
				normalizedValue = 0.5;
			} else {
				normalizedValue = (logCurrent - logMin) / (logMax - logMin);
			}
			
			// Generate a color from blue to red based on frequency
			const hue = 240 - normalizedValue * 200; // 240 is blue, 40 is orange-red
			return `hsl(${hue}, 70%, 50%)`;
		}, [minOccurrences, maxOccurrences]);

		return (
			<div ref={ref} className='overflow-hidden max-w-full max-h-full cursor-pointer'>
				<WordCloud
					data={sortedWords}
					fontSize={(word: Word) => calculateFontSize(word.value)}
					fontWeight={(word: Word) => calculateFontWeight(word.value)}
					fill={(word: Word) => colorFunction(word)}
					width={width}
					height={height}
					font="Poppins"
					rotate={0}
					padding={2}
					onWordMouseOver={onWordMouseOver}
					onWordMouseOut={onWordMouseOut}
				/>
			</div>
		)
	}
)

WordCloudComponentInner.displayName = 'WordCloudComponent';

export const WordCloudComponent = React.memo(WordCloudComponentInner);

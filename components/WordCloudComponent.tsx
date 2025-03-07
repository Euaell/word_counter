import React, { forwardRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { WordFrequency } from '@/utils/textProcessing';

const WordCloud = dynamic(() => import('react-d3-cloud'), { ssr: false });

export type Word = WordFrequency;

// Extended Word type with a random property for layout variation
interface EnhancedWord extends Word {
	random?: number;
}

type Props = {
	words: Word[];
	width: number;
	height: number;
	onWordMouseOver?: (event: MouseEvent, d: Word) => void;
	onWordMouseOut?: (event: MouseEvent, d: Word) => void;
}

// Configuration constants
const MAX_FONT_SIZE = 64; // Reduced max size to prevent clipping
const MIN_FONT_SIZE = 10; // Increased min size for better readability
const MAX_FONT_WEIGHT = 600;
const MIN_FONT_WEIGHT = 300;
const MAX_WORDS = 100; // Display more words
const SPIRAL = "archimedean"; // archimedean or rectangular
const PADDING = 3; // Increased padding between words
const ROTATE_FN = () => {
	// Randomly rotate words by 0, -30, or 30 degrees for a fuller cloud
	const angles = [0, 0, 0, 0, -30, 30]; // Bias toward 0 for readability
	return angles[Math.floor(Math.random() * angles.length)];
};

const WordCloudComponentInner = forwardRef<HTMLDivElement, Props>(
	({ words, width, height, onWordMouseOut, onWordMouseOver }, ref) => {
		// Sort and limit the words to display
		const sortedWords = useMemo(
			() => [...words]
				.sort((a, b) => b.value - a.value)
				.slice(0, MAX_WORDS)
				// Add a random factor to help with layout
				.map(word => ({
					...word,
					random: Math.random() * 0.3 + 0.85 // Random factor between 0.85 and 1.15
				})) as EnhancedWord[],
			[words]
		);

		// Find min and max frequencies for scaling
		const [minOccurrences, maxOccurrences] = useMemo(() => {
			if (sortedWords.length === 0) return [0, 0];
			const values = sortedWords.map((w) => w.value);
			const min = Math.min(...values);
			const max = Math.max(...values);
			return [min, max];
		}, [sortedWords]);

		/**
		 * Calculate font size using a logarithmic scale with clamping to prevent extreme sizes
		 * This creates a more balanced visual appearance with less extreme differences
		 */
		const calculateFontSize = useCallback(
			(word: EnhancedWord) => {
				const wordOccurrences = word.value;
				const randomFactor = word.random || 1; // Use the random factor for layout variance
				
				// Handle edge cases
				if (sortedWords.length <= 1) return MIN_FONT_SIZE + (MAX_FONT_SIZE - MIN_FONT_SIZE) / 2;
				if (maxOccurrences === minOccurrences) return MIN_FONT_SIZE + (MAX_FONT_SIZE - MIN_FONT_SIZE) / 2;
				
				// Use logarithmic scale for more balanced sizing
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
				
				// Scale and adjust with a dampening factor to prevent extreme sizes
				// Use a cubic root function to reduce extreme differences
				normalizedValue = Math.pow(normalizedValue, 1/3);
				
				// Calculate final font size with random factor for better layout
				const fontSize = MIN_FONT_SIZE + normalizedValue * (MAX_FONT_SIZE - MIN_FONT_SIZE) * randomFactor;
				
				// Ensure result is within bounds and return as integer
				return Math.floor(Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, fontSize)));
			},
			[maxOccurrences, minOccurrences, sortedWords]
		);

		// Font weight calculation with smoother scaling
		const calculateFontWeight = useCallback(
			(word: Word) => {
				if (maxOccurrences === minOccurrences) return (MAX_FONT_WEIGHT + MIN_FONT_WEIGHT) / 2;
				
				// Use square root scaling for more proportional font weight
				const normalizedValue = Math.sqrt((word.value - minOccurrences) / 
					(maxOccurrences - minOccurrences || 1));
					
				const fontWeight = MIN_FONT_WEIGHT + normalizedValue * (MAX_FONT_WEIGHT - MIN_FONT_WEIGHT);
				return Math.round(fontWeight / 100) * 100; // Round to nearest 100 for standard weights
			},
			[maxOccurrences, minOccurrences]
		);

		// Color function based on word frequency with a more vibrant palette
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
			
			// Create a more vibrant color palette
			// Use HSL color scale with a wider hue range
			const hue = 210 - normalizedValue * 170; // From blue (210) to red (40)
			const saturation = 65 + normalizedValue * 25; // 65% - 90%
			const lightness = 45 + (1 - normalizedValue) * 15; // 45% - 60%, darker for more important words
			
			return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
		}, [minOccurrences, maxOccurrences]);

		// Calculate optimal dimensions based on container
		const cloudWidth = width || 500;
		const cloudHeight = height || 400;

		return (
			<div ref={ref} className='overflow-hidden w-full h-full cursor-pointer'>
				<WordCloud
					data={sortedWords}
					fontSize={(word: EnhancedWord) => calculateFontSize(word)}
					fontWeight={(word: Word) => calculateFontWeight(word)}
					fill={(word: Word) => colorFunction(word)}
					width={cloudWidth}
					height={cloudHeight}
					font="Inter, system-ui, sans-serif" // Modern font stack
					spiral={SPIRAL}
					rotate={ROTATE_FN}
					padding={PADDING}
					random={() => 0.5} // More predictable layout
					onWordMouseOver={onWordMouseOver}
					onWordMouseOut={onWordMouseOut}
				/>
			</div>
		)
	}
)

WordCloudComponentInner.displayName = 'WordCloudComponent';

export const WordCloudComponent = React.memo(WordCloudComponentInner);

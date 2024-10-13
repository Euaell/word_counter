
import React, { forwardRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';

const WordCloud = dynamic(() => import('react-d3-cloud'), { ssr: false });

type Word = { text: string; value: number };

type Props = {
	words: Word[];
};

const MAX_FONT_SIZE = 200;
const MIN_FONT_SIZE = 30;
const MAX_FONT_WEIGHT = 700;
const MIN_FONT_WEIGHT = 400;
const MAX_WORDS = 150;

export const WordCloudComponent = forwardRef<HTMLDivElement, Props>(
	({ words }, ref) => {
		// Sorting and limiting the words
		const sortedWords = useMemo(
			() => [...words].sort((a, b) => b.value - a.value).slice(0, MAX_WORDS),
			[words]
		)

		// Calculating min and max occurrences
		const [minOccurrences, maxOccurrences] = useMemo(() => {
			const values = sortedWords.map((w) => w.value);
			const min = Math.min(...values);
			const max = Math.max(...values);
			return [min, max];
		}, [sortedWords])

		// Function to calculate font size
		const calculateFontSize = useCallback(
			(wordOccurrences: number) => {
				const normalizedValue =
				(wordOccurrences - minOccurrences) / (maxOccurrences - minOccurrences || 1);
				const fontSize =
				MIN_FONT_SIZE + normalizedValue * (MAX_FONT_SIZE - MIN_FONT_SIZE);
				return Math.round(fontSize);
			},
			[maxOccurrences, minOccurrences]
		)

		// Function to calculate font weight
		const calculateFontWeight = useCallback(
			(wordOccurrences: number) => {
				const normalizedValue =
					(wordOccurrences - minOccurrences) / (maxOccurrences - minOccurrences || 1);
				const fontWeight =
					MIN_FONT_WEIGHT +
					normalizedValue * (MAX_FONT_WEIGHT - MIN_FONT_WEIGHT);
				return Math.round(fontWeight);
			},
			[maxOccurrences, minOccurrences]
		)

		return (
			<div ref={ref} style={{ width: '100%', height: '100%' }}>
				<WordCloud
					data={sortedWords}
					fontSize={(word) => calculateFontSize(word.value)}
					fontWeight={(word) => calculateFontWeight(word.value)}
					width={900}
					height={500}
					font="Poppins"
					rotate={0}
					padding={2}
					random={() => 0.5}
				/>
			</div>
		)
	}
)

WordCloudComponent.displayName = 'WordCloudComponent';

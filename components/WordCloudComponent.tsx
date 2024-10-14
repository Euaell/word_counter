import React, { forwardRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';

const WordCloud = dynamic(() => import('react-d3-cloud'), { ssr: false });

export type Word = { text: string; value: number };

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

		const calculateFontSize = useCallback(
			(wordOccurrences: number) => {
				let normalizedValue;
				if (maxOccurrences === minOccurrences) {
					// Only one word or all words have the same frequency
					normalizedValue = 1;
				} else {
					normalizedValue = (wordOccurrences - minOccurrences) / (maxOccurrences - minOccurrences);
				}


				console.log("normalizedValue", normalizedValue);
				const fontSize =
					MIN_FONT_SIZE + normalizedValue * (MAX_FONT_SIZE - MIN_FONT_SIZE);
				return Math.round(fontSize);
			},
			[maxOccurrences, minOccurrences]
		);

		const calculateFontWeight = useCallback(
			(wordOccurrences: number) => {
				const normalizedValue =
					(wordOccurrences - minOccurrences) / (maxOccurrences - minOccurrences || 1);
				const fontWeight =
					MIN_FONT_WEIGHT + normalizedValue * (MAX_FONT_WEIGHT - MIN_FONT_WEIGHT);
				return Math.round(fontWeight);
			},
			[maxOccurrences, minOccurrences]
		)


		return (
			<div ref={ref} className='overflow-hidden max-w-full max-h-full cursor-pointer'>
				<WordCloud
					data={sortedWords}
					fontSize={(word) => calculateFontSize(word.value)}
					fontWeight={(word) => calculateFontWeight(word.value)}
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
	
export const WordCloudComponent = React.memo(WordCloudComponentInner);

WordCloudComponent.displayName = 'WordCloudComponent';

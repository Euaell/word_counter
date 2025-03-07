// Define stopwords
const stopWords = new Set([
	'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
	'any', 'are', "aren't", 'as', 'at', 'be', 'because', 'been', 'before', 'being',
	'below', 'between', 'both', 'but', 'by', "can't", 'cannot', 'could', "couldn't",
	'did', "didn't", 'do', 'does', "doesn't", 'doing', "don't", 'down', 'during',
	'each', 'few', 'for', 'from', 'further', 'had', "hadn't", 'has', "hasn't",
	'have', "haven't", 'having', 'he', "he'd", "he'll", "he's", 'her', 'here',
	"here's", 'hers', 'herself', 'him', 'himself', 'his', 'how', "how's", 'i',
	"i'd", "i'll", "i'm", "i've", 'if', 'in', 'into', 'is', "isn't", 'it', "it's",
	'its', 'itself', "let's", 'me', 'more', 'most', "mustn't", 'my', 'myself',
	'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought',
	'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', "shan't", 'she',
	"she'd", "she'll", "she's", 'should', "shouldn't", 'so', 'some', 'such', 'than',
	'that', "that's", 'the', 'their', 'theirs', 'them', 'themselves', 'then',
	'there', "there's", 'these', 'they', "they'd", "they'll", "they're", "they've",
	'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
	"wasn't", 'we', "we'd", "we'll", "we're", "we've", 'were', "weren't", 'what',
	"what's", 'when', "when's", 'where', "where's", 'which', 'while', 'who',
	"who's", 'whom', 'why', "why's", 'with', "won't", 'would', "wouldn't", 'you',
	"you'd", "you'll", "you're", "you've", 'your', 'yours', 'yourself', 'yourselves',
]);

// Common positive and negative words for sentiment analysis
const positiveWords = new Set([
	'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'terrific',
	'outstanding', 'superb', 'brilliant', 'awesome', 'fabulous', 'incredible',
	'marvelous', 'perfect', 'love', 'happy', 'joy', 'beautiful', 'best',
	'better', 'positive', 'nice', 'pleasant', 'delightful', 'impressive'
]);

const negativeWords = new Set([
	'bad', 'terrible', 'awful', 'horrible', 'poor', 'disappointing', 'worst',
	'hate', 'dislike', 'sad', 'angry', 'upset', 'negative', 'wrong', 'fail',
	'failure', 'problem', 'difficult', 'hard', 'trouble', 'unfortunate', 'unpleasant',
	'annoying', 'frustrating', 'mediocre', 'inferior'
]);

// Word frequency interface
export interface WordFrequency {
	text: string;
	value: number;
	percentage?: number;
}

export interface TextAnalysisResult {
	wordFrequencies: WordFrequency[];
	totalWords: number;
	uniqueWords: number;
	averageWordLength: number;
	sentimentScore: number; // -1 to 1 scale
	readabilityScore: number; // 0-100 scale (higher is easier to read)
	topBigrams: { text: string; value: number }[];
}

/**
 * Process text to extract and normalize tokens with proper handling of
 * punctuation, contractions, and special characters.
 * 
 * @param text Input text to tokenize
 * @param removeStopWords Whether to filter out common stop words
 * @returns Array of normalized tokens
 */
export function tokenizeText(text: string, removeStopWords: boolean = true): string[] {
	// Handle empty input
	if (!text || typeof text !== 'string') return [];
	
	// Convert to lowercase and normalize whitespace
	const normalizedText = text.toLowerCase().trim();
	
	// Replace certain characters with spaces to ensure proper word boundaries
	const spacedText = normalizedText
		.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ') // Replace punctuation with spaces
		.replace(/\s{2,}/g, ' ');                     // Replace multiple spaces with single space
	
	// Split into words and filter
	const words = spacedText.split(/\s+/).filter(word => {
		// Remove empty strings and single characters (except 'a' and 'i' which are valid words)
		if (!word || (word.length === 1 && !['a', 'i'].includes(word))) return false;
		
		// Remove stop words if requested
		if (removeStopWords && stopWords.has(word)) return false;
		
		return true;
	});
	
	return words;
}

/**
 * Get raw tokens including stopwords for readability analysis
 * This preserves all words for analysis purposes
 */
function getRawTokens(text: string): string[] {
	return tokenizeText(text, false);
}

/**
 * Get sentences for readability analysis
 * Handles various end-of-sentence punctuation and edge cases
 */
function getSentences(text: string): string[] {
	if (!text) return [];
	
	// Look for sentence boundaries with various punctuation followed by whitespace or end of text
	return text
		.split(/[.!?]+(?=\s|$)/)
		.map(s => s.trim())
		.filter(s => s.length > 0);
}

/**
 * Calculate word frequency from text with advanced options
 * 
 * @param text Input text
 * @param options Optional configuration
 * @returns Array of word frequency objects sorted by frequency
 */
export function getWordFrequencies(
	text: string,
	options: {
		maxResults?: number;
		includePercentages?: boolean;
		caseSensitive?: boolean;
		minWordLength?: number;
	} = {}
): WordFrequency[] {
	const {
		maxResults = 100,
		includePercentages = false,
		caseSensitive = false,
		minWordLength = 2
	} = options;
	
	// Handle empty input
	if (!text) return [];
	
	// Tokenize the text
	const tokens = tokenizeText(text);
	
	// Count word frequencies
	const wordCount: Record<string, number> = {};
	let totalWords = 0;
	
	for (const token of tokens) {
		// Apply word length filter
		if (token.length < minWordLength) continue;
		
		// Handle case sensitivity
		const key = caseSensitive ? token : token.toLowerCase();
		
		// Increment counter
		wordCount[key] = (wordCount[key] || 0) + 1;
		totalWords++;
	}
	
	// Convert to array and sort by frequency (highest first)
	let result = Object.entries(wordCount)
		.map(([text, value]) => ({ text, value }))
		.sort((a, b) => b.value - a.value);
	
	// Limit results if needed
	if (maxResults > 0) {
		result = result.slice(0, maxResults);
	}
	
	// Calculate percentages if requested
	if (includePercentages && totalWords > 0) {
		result.forEach(item => {
			item.percentage = (item.value / totalWords) * 100;
		});
	}
	
	return result;
}

// Calculate bigrams (pairs of adjacent words)
function getBigrams(tokens: string[]): { text: string; value: number }[] {
	if (tokens.length < 2) return [];
	
	const bigramCounts: Record<string, number> = {};
	
	for (let i = 0; i < tokens.length - 1; i++) {
		const bigram = `${tokens[i]} ${tokens[i + 1]}`;
		bigramCounts[bigram] = (bigramCounts[bigram] || 0) + 1;
	}
	
	return Object.entries(bigramCounts)
		.map(([text, value]) => ({ text, value }))
		.sort((a, b) => b.value - a.value)
		.slice(0, 10); // Return top 10 bigrams
}

// Calculate sentiment score (-1 to 1)
function calculateSentiment(tokens: string[]): number {
	if (tokens.length === 0) return 0;
	
	let positiveCount = 0;
	let negativeCount = 0;
	
	tokens.forEach(token => {
		if (positiveWords.has(token)) positiveCount++;
		if (negativeWords.has(token)) negativeCount++;
	});
	
	const total = tokens.length;
	return (positiveCount - negativeCount) / total;
}

// Calculate readability score (simplified Flesch Reading Ease)
function calculateReadability(text: string): number {
	const sentences = getSentences(text);
	const words = getRawTokens(text);
	
	if (sentences.length === 0 || words.length === 0) return 0;
	
	const averageSentenceLength = words.length / sentences.length;
	const averageWordLength = words.join('').length / words.length;
	
	// Simplified Flesch Reading Ease formula
	const readabilityScore = 206.835 - (1.015 * averageSentenceLength) - (84.6 * averageWordLength / 5);
	
	// Clamp between 0-100
	return Math.max(0, Math.min(100, readabilityScore));
}

// Calculate average word length
function calculateAverageWordLength(tokens: string[]): number {
	if (tokens.length === 0) return 0;
	const totalLength = tokens.reduce((sum, word) => sum + word.length, 0);
	return totalLength / tokens.length;
}

// Comprehensive text analysis
export function analyzeText(text: string): TextAnalysisResult {
	const tokens = tokenizeText(text);
	const rawTokens = getRawTokens(text);
	const wordFrequencies = getWordFrequencies(text, { 
		includePercentages: true,
		maxResults: 150
	});
	
	return {
		wordFrequencies,
		totalWords: rawTokens.length,
		uniqueWords: wordFrequencies.length,
		averageWordLength: calculateAverageWordLength(rawTokens),
		sentimentScore: calculateSentiment(tokens),
		readabilityScore: calculateReadability(text),
		topBigrams: getBigrams(tokens)
	};
}

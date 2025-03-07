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

export interface TextAnalysisResult {
	wordFrequencies: { text: string; value: number }[];
	totalWords: number;
	uniqueWords: number;
	averageWordLength: number;
	sentimentScore: number; // -1 to 1 scale
	readabilityScore: number; // 0-100 scale (higher is easier to read)
	topBigrams: { text: string; value: number }[];
}

// Simple tokenizer function
export function getTokens(text: string): string[] {
	const lowerText = text.toLowerCase().replace(/[^a-z\s]/g, '');
	const tokens = lowerText.split(/\s+/);
	return tokens.filter((token) => token.length > 1 && !stopWords.has(token));
}

// Get raw tokens including stopwords for readability analysis
function getRawTokens(text: string): string[] {
	const lowerText = text.toLowerCase().replace(/[^a-z\s.!?]/g, '');
	return lowerText.split(/\s+/).filter(token => token.length > 0);
}

// Get sentences for readability analysis
function getSentences(text: string): string[] {
	return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
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

// Main function to get word frequencies
export function getWordFrequencies(text: string): { text: string; value: number }[] {
	const tokens = getTokens(text);
	const wordCounts: Record<string, number> = {};
  
	tokens.forEach((token) => {
		wordCounts[token] = (wordCounts[token] || 0) + 1;
	})

	return Object.entries(wordCounts).map(([text, value]) => ({ text, value }));
}

// Comprehensive text analysis
export function analyzeText(text: string): TextAnalysisResult {
	const tokens = getTokens(text);
	const rawTokens = getRawTokens(text);
	const wordFrequencies = getWordFrequencies(text);
	
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


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
  
// Simple tokenizer function
export function getTokens(text: string): string[] {
	const lowerText = text.toLowerCase().replace(/[^a-z\s]/g, '');
	const tokens = lowerText.split(/\s+/);
	return tokens.filter((token) => token.length > 1 && !stopWords.has(token));
}
  
export function getWordFrequencies(text: string): { text: string; value: number }[] {
	const tokens = getTokens(text);
	const wordCounts: Record<string, number> = {};
  
	tokens.forEach((token) => {
		wordCounts[token] = (wordCounts[token] || 0) + 1;
	})

	return Object.entries(wordCounts).map(([text, value]) => ({ text, value }));
}

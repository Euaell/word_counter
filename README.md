# Advanced Word Cloud and Text Analysis Tool

A powerful text analysis application built with Next.js, React, TypeScript, and Tailwind CSS. This tool visualizes word frequencies with an interactive word cloud and provides comprehensive text analysis metrics including readability scores, sentiment analysis, and more.

![Word Cloud Example](./screenshot.png)

## Features

### Interactive Word Cloud
- **Dynamic Visualization**: Real-time word cloud generation that updates as you type or upload text
- **Proportional Sizing**: Words are sized using logarithmic scaling for better visual representation of frequencies
- **Color Gradients**: Words are colored based on frequency for enhanced visualization
- **Interactive Tooltips**: Hover over words to see exact frequency and percentage information

### Comprehensive Text Analysis
- **Word Frequency Analysis**: Detailed breakdown of word occurrences with percentage calculations
- **Readability Metrics**: 
  - Flesch Reading Ease Score (0-100 scale where higher scores mean easier to read)
  - Flesch-Kincaid Grade Level (estimates the US grade level required to understand the text)
  - Syllable analysis and sentence length statistics
- **Sentiment Analysis**: Evaluation of text sentiment (positive, negative, or neutral)
- **Phrase Detection**: Identification of common word pairs (bigrams) in the text

### User-Friendly Interface
- **File Upload**: Support for analyzing text files (.txt, .md, .csv)
- **Responsive Design**: Works well on desktop and mobile devices
- **Statistics Dashboard**: Clean, organized presentation of text metrics
- **Modern UI**: Built with Tailwind CSS for a sleek and responsive interface

## Getting Started

### Prerequisites
- Node.js (v14 or newer)
- npm or Yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/word-counter.git
cd word-counter
```

2. Install dependencies
```bash
yarn install
# or
npm install
```

3. Start the development server
```bash
yarn dev
# or
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

### Word Frequency Calculation
Text processing follows these steps:
1. **Tokenization**: Text is split into individual words with careful handling of punctuation and whitespace
2. **Normalization**: Words are normalized to lowercase (optional) and filtered by length
3. **Frequency Counting**: Each unique word's occurrences are counted and sorted
4. **Visualization**: The top words are displayed in the word cloud with size proportional to frequency using logarithmic scaling for better visualization

### Readability Analysis
The application implements industry-standard readability formulas:

1. **Flesch Reading Ease**:
   ```
   206.835 - 1.015 × (words/sentences) - 84.6 × (syllables/words)
   ```
   - Scale: 0-100 (higher = easier to read)
   - 90-100: Very easy (5th grade)
   - 60-70: Standard (8th-9th grade)
   - 0-30: Very difficult (college graduate)

2. **Flesch-Kincaid Grade Level**:
   ```
   0.39 × (words/sentences) + 11.8 × (syllables/words) - 15.59
   ```
   - Result represents US grade level needed to understand the text
   - Example: 8.2 means an 8th grader can understand the text

### Syllable Counting
The application uses a heuristic approach to count syllables in English words:
- Counting vowel groups
- Handling special cases like silent 'e'
- Accounting for common patterns in English pronunciation

### Sentiment Analysis
Sentiment is calculated by:
1. Identifying positive and negative words using curated word lists
2. Calculating the ratio of positive to negative words
3. Providing a score from -1 (very negative) to +1 (very positive)

## Technologies Used

- **Next.js**: React framework for server-side rendering and application routing
- **React**: Frontend UI library
- **TypeScript**: Strongly-typed JavaScript for better code quality
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **react-d3-cloud**: Word cloud visualization library

## Development

### Project Structure
```
/
├── app/                # Next.js app directory
│   ├── page.tsx        # Main page component
│   ├── layout.tsx      # App layout
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── WordCloudComponent.tsx  # Word cloud visualization
│   ├── StatisticsPanel.tsx     # Text statistics display
│   └── SentimentVisualizer.tsx # Sentiment analysis display
├── utils/              # Utility functions
│   └── textProcessing.ts     # Text analysis logic
├── public/             # Static assets
└── ...                 # Configuration files
```

### Key Components

1. **WordCloudComponent**: Renders the interactive word cloud with frequency-based sizing
2. **StatisticsPanel**: Displays text metrics including readability scores and word statistics
3. **SentimentVisualizer**: Visualizes sentiment analysis results
4. **textProcessing.ts**: Core text analysis logic including word frequency, readability, and sentiment analysis

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [react-d3-cloud](https://github.com/Yoctol/react-d3-cloud) for the word cloud visualization
- The Flesch-Kincaid readability research for text analysis formulas

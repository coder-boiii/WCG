let afinnLexicon = new Map(); 
// A map to store the AFINN lexicon
const MAX_WORDS = 50; // Number of top words to display
const MIN_FONT_SIZE = 10; // Minimum font size in pixels
const MAX_FONT_SIZE = 40; // Maximum font size in pixels

// Automatically load AFINN lexicon
function loadAFINN() {
    fetch('afinn.txt')
        .then(response => response.text())
        .then(text => {
            parseAFINN(text);
            console.log('AFINN Lexicon Loaded:', Array.from(afinnLexicon.entries()));
        })
        .catch(error => {
            console.error('Error loading AFINN file:', error);
        });
}

// Parse AFINN text file
function parseAFINN(text) {
    const lines = text.trim().split('\n');
    lines.forEach(line => {
        const [word, score] = line.split(/\s+/);
        if (word && !isNaN(score)) {
            afinnLexicon.set(word.toLowerCase(), parseInt(score, 10));
        } else {
            console.warn('Skipping invalid line:', line);
        }
    });
}

// Function to generate word cloud
function generateWordCloud() {
    const fileInput = document.getElementById('fileInput').files[0];

    if (fileInput) {
        const reader = new FileReader();

        reader.onload = function(event) {
            try {
                const text = event.target.result;
                const words = parseCSV(text);
                console.log('Extracted Words:', words);

                const filteredWords = filterWords(words, afinnLexicon);
                console.log('Filtered Words:', filteredWords);

                const topWords = getTopWords(filteredWords, MAX_WORDS);
                console.log('Top Words:', topWords);

                const normalizedWords = normalizeWordSizes(topWords, MIN_FONT_SIZE, MAX_FONT_SIZE);
                console.log('Normalized Words:', normalizedWords);

                renderWordCloud(normalizedWords);
            } catch (error) {
                console.error('Error processing file:', error);
                alert('Error processing file. Please ensure it is properly formatted.');
            }
        };

        reader.onerror = function() {
            console.error('Error reading file.');
            alert('Failed to read the file. Please try again.');
        };

        reader.readAsText(fileInput); // Read the whole file at once
    } else {
        alert('Please upload a file.');
    }
}

// Function to parse CSV file containing sentences
function parseCSV(csv) {
    const wordCounts = {};
    const rows = csv.trim().split('\n');

    if (rows.length === 0) {
        console.error('CSV file is empty.');
        throw new Error('CSV file is empty.');
    }

    rows.forEach(row => {
        if (!row.trim()) return;

        const sentences = row.split(/;\s*|\.\s*|\!\s*|\?\s*/);
        sentences.forEach(sentence => {
            const words = sentence.split(/\s+/).map(word => word.toLowerCase()).filter(word => word.length > 0);
            words.forEach(word => {
                if (wordCounts[word]) {
                    wordCounts[word]++;
                } else {
                    wordCounts[word] = 1;
                }
            });
        });
    });

    return Object.entries(wordCounts);
}

// Function to filter words based on AFINN lexicon
function filterWords(words, afinnLexicon) {
    return words.filter(([word]) => afinnLexicon.has(word));
}

// Function to get the top N words based on frequency
function getTopWords(words, topN) {
    return words
        .sort((a, b) => b[1] - a[1]) // Sort by frequency in descending order
        .slice(0, topN); // Get top N words
}

// Function to normalize word sizes
function normalizeWordSizes(words, minSize, maxSize) {
    const maxFrequency = Math.max(...words.map(([_, freq]) => freq));
    const minFrequency = Math.min(...words.map(([_, freq]) => freq));
    const sizeRange = maxSize - minSize;
    const freqRange = maxFrequency - minFrequency;

    return words.map(([word, freq]) => {
        const normalizedSize = minSize + ((freq - minFrequency) / freqRange) * sizeRange;
        return [word, normalizedSize];
    });
}

// Function to render the word cloud with size based on frequency
function renderWordCloud(words) {
    const canvas = document.getElementById('wordCloudCanvas');
    if (canvas) {
        WordCloud(canvas, { 
            list: words,
            gridSize: 8,
            weightFactor: function (size) {
                return size; // Size is directly set here
            },
            fontFamily: 'Times, serif',
            color: 'random-dark',
            backgroundColor: '#f0f0f5',
            rotateRatio: 0.5,
            rotationSteps: 2,
        });
    } else {
        console.error('Canvas element not found.');
        alert('Error: Canvas element not found.');
    }
}

// Load the AFINN lexicon when the page loads
window.onload = function() {
    loadAFINN();
};

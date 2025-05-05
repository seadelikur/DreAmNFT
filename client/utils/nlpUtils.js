// client/utils/nlpUtils.js

/**
 * @fileoverview Natural Language Processing (NLP) utility functions for the DreAmNFT app.
 * Provides basic text analysis capabilities like keyword extraction, sentiment analysis,
 * text simplification, and text processing for AI utilities.
 */

// Stop words list (common English words to ignore during keyword extraction)
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
  'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
  'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
  'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
  'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
  'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but',
  'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with',
  'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over',
  'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
  'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'd', 'll', 'm',
  'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn', 'hasn',
  'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn', 'wasn',
  'weren', 'won', 'wouldn', 'like', 'get', 'go', 'see', 'dream', 'dreamed', 'dreaming'
]);

// Basic sentiment word lists
const POSITIVE_WORDS = new Set(['happy', 'joy', 'beautiful', 'amazing', 'wonderful', 'love', 'like', 'great', 'good', 'success', 'achieve', 'peace', 'fly', 'soar', 'bright', 'light', 'win', 'friend', 'hug', 'laugh']);
const NEGATIVE_WORDS = new Set(['sad', 'fear', 'angry', 'lost', 'dark', 'fall', 'chase', 'monster', 'nightmare', 'bad', 'terrible', 'awful', 'pain', 'cry', 'scream', 'alone', 'trapped', 'failure', 'anxiety', 'stress']);

/**
 * Cleans and tokenizes text into an array of words.
 * Removes punctuation, converts to lowercase, and splits into words.
 * @param {string} text - The input text.
 * @returns {string[]} An array of cleaned words.
 */
const tokenize = (text) => {
  if (!text || typeof text !== 'string') {
    return [];
  }
  const cleanedText = text.toLowerCase().replace(/[.,!?;:()"“”-]/g, '');
  return cleanedText.split(/\s+/).filter(word => word.length > 0);
};

/**
 * Extracts potential keywords from a given text.
 * Removes stop words and counts word frequencies. Returns top N keywords.
 * @param {string} text - The dream description or text to analyze.
 * @param {number} [limit=5] - The maximum number of keywords to return.
 * @returns {string[]} An array of the most frequent non-stop words.
 */
export const extractKeywords = (text, limit = 5) => {
  const words = tokenize(text);
  if (words.length === 0) return [];

  const wordFrequencies = {};
  words.forEach(word => {
    if (!STOP_WORDS.has(word) && word.length > 2) {
      wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
    }
  });

  const sortedKeywords = Object.entries(wordFrequencies)
    .sort(([, freqA], [, freqB]) => freqB - freqA)
    .map(([word]) => word);

  return sortedKeywords.slice(0, limit);
};

/**
 * Performs a basic sentiment analysis on the text.
 * @param {string} text - The text to analyze.
 * @returns {'positive' | 'negative' | 'neutral'} The perceived sentiment.
 */
export const analyzeSentiment = (text) => {
  const words = tokenize(text);
  if (words.length === 0) return 'neutral';

  let positiveScore = 0;
  let negativeScore = 0;

  words.forEach(word => {
    if (POSITIVE_WORDS.has(word)) positiveScore++;
    else if (NEGATIVE_WORDS.has(word)) negativeScore++;
  });

  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
};

/**
 * Calculates the estimated reading time for a given text.
 * @param {string} text - The text content.
 * @param {number} [wpm=200] - Average words per minute reading speed.
 * @returns {number} Estimated reading time in minutes.
 */
export const estimateReadingTime = (text, wpm = 200) => {
  const words = tokenize(text);
  if (words.length === 0 || wpm <= 0) return 0;
  return Math.ceil(words.length / wpm);
};

/**
 * Summarizes text by extracting the first N sentences.
 * @param {string} text - The text to summarize.
 * @param {number} [sentenceCount=2] - The number of sentences to extract.
 * @returns {string} A summary consisting of the first N sentences.
 */
export const simpleSummarize = (text, sentenceCount = 2) => {
  if (!text || typeof text !== 'string') return '';
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (!sentences || sentences.length === 0) return text;
  return sentences.slice(0, sentenceCount).join(' ').trim();
};

// --- Functions expected by aiUtils.js ---

/**
 * Processes dream text for AI analysis (e.g., for similarity comparison).
 * Currently returns cleaned text joined as a string.
 * @param {string} text - The raw dream text.
 * @returns {string} Processed text string.
 */
export const processDreamText = (text) => {
  // For calculateSimilarity, returning cleaned text might be better than keywords
  return tokenize(text).join(' ');
};

/**
 * Processes audio transcription text for AI analysis.
 * Currently returns cleaned text joined as a string.
 * @param {string} transcription - The raw audio transcription text.
 * @returns {string} Processed text string.
 */
export const processAudioTranscription = (transcription) => {
  // Apply similar processing as dream text
  return tokenize(transcription).join(' ');
};
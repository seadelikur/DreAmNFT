// src/utils/dreamAnalysisUtils.js
import axios from 'axios';
import { showErrorToast } from './toastUtils';

// API endpoints
const AI_API_ENDPOINT = 'https://api.dreamnft.com/ai'; // Replace with actual API endpoint

/**
 * Analyze dream text and extract insights
 * @param {string} dreamText - The dream text to analyze
 * @returns {Promise<object>} Analysis results
 */
export const analyzeDreamText = async (dreamText) => {
  try {
    if (!dreamText || dreamText.trim().length < 20) {
      return {
        success: false,
        error: 'Dream text is too short for analysis. Please provide more details.'
      };
    }

    const response = await axios.post(`${AI_API_ENDPOINT}/analyze`, {
      text: dreamText
    });

    return {
      success: true,
      analysis: response.data
    };
  } catch (error) {
    console.error('Error analyzing dream text:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to analyze dream. Please try again.'
    };
  }
};

/**
 * Check dream authenticity
 * @param {string} dreamText - The dream text to check
 * @param {object} audioData - Optional audio recording data
 * @returns {Promise<object>} Authenticity score and feedback
 */
export const checkDreamAuthenticity = async (dreamText, audioData = null) => {
  try {
    const payload = {
      text: dreamText
    };

    if (audioData) {
      payload.audioUrl = audioData.url;
      payload.audioDuration = audioData.duration;
    }

    const response = await axios.post(`${AI_API_ENDPOINT}/authenticate`, payload);

    return {
      success: true,
      authenticityScore: response.data.score,
      feedback: response.data.feedback,
      isAuthentic: response.data.score >= 70 // Threshold for authentic dreams
    };
  } catch (error) {
    console.error('Error checking dream authenticity:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to check dream authenticity. Please try again.'
    };
  }
};

/**
 * Generate dream art based on dream description
 * @param {string} dreamDescription - The dream description
 * @param {string} style - Optional art style
 * @returns {Promise<object>} Generated art URL
 */
export const generateDreamArt = async (dreamDescription, style = 'surreal') => {
  try {
    if (!dreamDescription || dreamDescription.trim().length < 10) {
      return {
        success: false,
        error: 'Dream description is too short. Please provide more details.'
      };
    }

    const response = await axios.post(`${AI_API_ENDPOINT}/generate-art`, {
      description: dreamDescription,
      style: style
    });

    return {
      success: true,
      imageUrl: response.data.imageUrl,
      promptUsed: response.data.prompt
    };
  } catch (error) {
    console.error('Error generating dream art:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to generate dream art. Please try again.'
    };
  }
};

/**
 * Calculate dream rarity based on content and emotional intensity
 * @param {string} dreamText - The dream text
 * @param {object} analysis - Dream analysis data
 * @returns {Promise<object>} Rarity score and level
 */
export const calculateDreamRarity = async (dreamText, analysis = null) => {
  try {
    // If analysis is not provided, get it first
    let dreamAnalysis = analysis;
    if (!dreamAnalysis) {
      const analysisResult = await analyzeDreamText(dreamText);
      if (!analysisResult.success) {
        throw new Error(analysisResult.error);
      }
      dreamAnalysis = analysisResult.analysis;
    }

    const response = await axios.post(`${AI_API_ENDPOINT}/calculate-rarity`, {
      text: dreamText,
      analysis: dreamAnalysis
    });

    const rarityLevels = [
      { min: 0, max: 50, level: 'Common', color: '#A0A0A0' },
      { min: 51, max: 70, level: 'Uncommon', color: '#4CAF50' },
      { min: 71, max: 85, level: 'Rare', color: '#2196F3' },
      { min: 86, max: 95, level: 'Epic', color: '#9C27B0' },
      { min: 96, max: 100, level: 'Legendary', color: '#FFC107' }
    ];

    const score = response.data.rarityScore;
    const rarityInfo = rarityLevels.find(level => score >= level.min && score <= level.max);

    return {
      success: true,
      rarityScore: score,
      rarityLevel: rarityInfo.level,
      rarityColor: rarityInfo.color,
      rarityFactors: response.data.factors
    };
  } catch (error) {
    console.error('Error calculating dream rarity:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to calculate dream rarity. Please try again.'
    };
  }
};

/**
 * Get dream patterns and insights over time
 * @param {Array} dreams - Array of dream data
 * @returns {Promise<object>} Dream patterns and insights
 */
export const getDreamPatterns = async (dreams) => {
  try {
    if (!dreams || !Array.isArray(dreams) || dreams.length < 3) {
      return {
        success: false,
        error: 'Not enough dreams to analyze patterns. Record more dreams to unlock insights.'
      };
    }

    const response = await axios.post(`${AI_API_ENDPOINT}/patterns`, {
      dreams: dreams.map(dream => ({
        id: dream.id,
        text: dream.description,
        date: dream.createdAt,
        emotions: dream.analysis?.emotions || []
      }))
    });

    return {
      success: true,
      patterns: response.data
    };
  } catch (error) {
    console.error('Error analyzing dream patterns:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to analyze dream patterns. Please try again.'
    };
  }
};

/**
 * Extract keywords and tags from dream text
 * @param {string} dreamText - The dream text
 * @returns {Promise<object>} Extracted keywords and tags
 */
export const extractDreamTags = async (dreamText) => {
  try {
    if (!dreamText || dreamText.trim().length < 20) {
      return {
        success: false,
        error: 'Dream text is too short. Please provide more details.'
      };
    }

    const response = await axios.post(`${AI_API_ENDPOINT}/extract-tags`, {
      text: dreamText
    });

    return {
      success: true,
      tags: response.data.tags,
      keywords: response.data.keywords
    };
  } catch (error) {
    console.error('Error extracting dream tags:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to extract tags. Please try again.'
    };
  }
};

/**
 * Analyze dream audio for emotional patterns
 * @param {string} audioUrl - URL of the audio recording
 * @returns {Promise<object>} Audio analysis results
 */
export const analyzeDreamAudio = async (audioUrl) => {
  try {
    if (!audioUrl) {
      return {
        success: false,
        error: 'No audio recording provided.'
      };
    }

    const response = await axios.post(`${AI_API_ENDPOINT}/analyze-audio`, {
      audioUrl
    });

    return {
      success: true,
      analysis: response.data
    };
  } catch (error) {
    console.error('Error analyzing dream audio:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to analyze audio. Please try again.'
    };
  }
};

/**
 * Generate sound art based on dream
 * @param {string} dreamText - The dream text
 * @returns {Promise<object>} Generated sound art URL
 */
export const generateDreamSoundArt = async (dreamText) => {
  try {
    if (!dreamText || dreamText.trim().length < 20) {
      return {
        success: false,
        error: 'Dream text is too short. Please provide more details.'
      };
    }

    const response = await axios.post(`${AI_API_ENDPOINT}/generate-sound`, {
      text: dreamText
    });

    return {
      success: true,
      audioUrl: response.data.audioUrl,
      duration: response.data.duration,
      moodTags: response.data.moodTags
    };
  } catch (error) {
    console.error('Error generating dream sound art:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to generate sound art. Please try again.'
    };
  }
};
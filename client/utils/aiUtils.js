// client/utils/aiUtils.js
import axios from 'axios';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// React Native için base64 decode fonksiyonunu import et
import base64 from 'react-native-base64';
// nlpUtils'dan GEREKLİ ve EXPORT EDİLMİŞ fonksiyonları import et
import { processDreamText, processAudioTranscription } from './nlpUtils';

// --- Configuration ---
// API Anahtarları (app.json -> "extra" bölümünden veya .env'den gelmeli)
// Expo'nun önerdiği EXPO_PUBLIC_ önekini kullandığından emin ol!
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const STABILITY_API_KEY = process.env.EXPO_PUBLIC_STABILITY_API_KEY;

// API Endpointleri
const OPENAI_API_URL = 'https://api.openai.com/v1/';
const STABILITY_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';

// --- Helper Functions ---

/**
 * Converts a base64 string to a Blob object using react-native-base64.
 * @param {string} base64Data - The base64 encoded string.
 * @param {string} mimeType - The MIME type of the data (e.g., 'image/png').
 * @returns {Blob} The Blob object.
 * @throws {Error} If base64 decoding fails.
 */
const base64ToBlob = (base64Data, mimeType) => {
  try {
    const byteCharacters = base64.decode(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  } catch (error) {
    console.error("Error decoding base64 string in base64ToBlob:", error);
    throw new Error("Failed to decode base64 string.");
  }
};

/**
 * Calculates text similarity using Jaccard index.
 * Compares the sets of unique words between two texts.
 * @param {string | null} text1 - First text string.
 * @param {string | null} text2 - Second text string.
 * @returns {number} Similarity score between 0 and 1. Returns 0 if either text is null/empty.
 */
const calculateSimilarity = (text1, text2) => {
  if (!text1 || !text2) {
    return 0;
  }
  try {
    const words1 = new Set(text1.toLowerCase().split(/\W+/).filter(Boolean));
    const words2 = new Set(text2.toLowerCase().split(/\W+/).filter(Boolean));

    if (words1.size === 0 || words2.size === 0) {
      return 0;
    }

    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    return union.size === 0 ? 0 : intersection.size / union.size; // Avoid division by zero
  } catch (error) {
    console.error("Error calculating similarity:", error);
    return 0; // Return 0 on error
  }
};


// --- Core AI Functions (Exported) ---

/**
 * Validates the authenticity of a dream using text analysis and optional audio comparison via OpenAI.
 * @param {string} dreamText - The text description of the dream.
 * @param {string|null} [audioTranscription=null] - Optional text transcription of audio recording.
 * @returns {Promise<object>} Result object with authenticity score and analysis.
 */
export const validateDreamAuthenticity = async (dreamText, audioTranscription = null) => {
  console.log("Validating dream authenticity...");
  if (!OPENAI_API_KEY) {
    console.error("OpenAI API Key is missing! Check environment variables (EXPO_PUBLIC_OPENAI_API_KEY).");
    return { success: false, error: "OpenAI API Key is not configured." };
  }
  if (!dreamText || typeof dreamText !== 'string' || dreamText.trim().length === 0) {
     return { success: false, error: "Dream text cannot be empty." };
  }

  try {
    // Process texts using functions from nlpUtils
    const processedText = processDreamText(dreamText); // Assumes this returns a non-empty string if dreamText is valid
    let processedAudio = null;
    let textAudioSimilarity = 0; // Initialize similarity

    if (audioTranscription && typeof audioTranscription === 'string' && audioTranscription.trim().length > 0) {
      console.log("Processing audio transcription...");
      processedAudio = processAudioTranscription(audioTranscription);
      textAudioSimilarity = calculateSimilarity(processedText, processedAudio);
      console.log(`Text-Audio Similarity: ${textAudioSimilarity.toFixed(2)}`);
    }

    // Construct prompt for GPT-4 analysis
    const prompt = `
    Analyze the following text to determine if it likely describes a genuine dream experience. Focus on characteristics like illogical sequences, emotional intensity, bizarre elements, common dream themes (flying, falling, being chased), sensory details, and narrative fragmentation. Avoid simply checking for the word "dream".

    Text: "${dreamText}"

    Provide a likelihood score (0-100) and a brief justification based on dream psychology principles. Respond ONLY with the score and justification. Example: "Score: 85/100. Justification: The text exhibits strong emotional shifts and illogical transitions typical of dreams."
    `;

    console.log("Sending request to OpenAI for authenticity analysis...");
    const response = await axios.post(
      `${OPENAI_API_URL}chat/completions`,
      {
        model: "gpt-4", // Consider "gpt-3.5-turbo" for cost savings if acceptable
        messages: [
          { role: "system", content: "You are an expert in dream psychology, analyzing text for dream-like qualities." },
          { role: "user", content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );
    console.log("Received response from OpenAI.");

    const analysis = response.data.choices[0].message.content;

    // Extract score robustly
    const scoreMatch = analysis.match(/Score:\s*(\d+)/i);
    let score = 50; // Default score
    if (scoreMatch && scoreMatch[1]) {
      score = parseInt(scoreMatch[1], 10);
    } else {
       console.warn("Could not parse score from OpenAI response:", analysis);
    }

    // Adjust score based on audio similarity if available
    let finalScore = score;
    if (processedAudio) {
      // Apply bonus/penalty based on similarity
      if (textAudioSimilarity > 0.7) finalScore = Math.min(100, finalScore + 15);
      else if (textAudioSimilarity > 0.5) finalScore = Math.min(100, finalScore + 10);
      else if (textAudioSimilarity < 0.2) finalScore = Math.max(0, finalScore - 10);
    }

    const isAuthentic = finalScore >= 65; // Authenticity threshold
    console.log(`Authenticity validation complete. Score: ${finalScore}, Authentic: ${isAuthentic}`);

    return {
      success: true,
      isAuthentic,
      confidence: finalScore / 100,
      score: finalScore,
      analysis,
      textAudioSimilarity: processedAudio ? textAudioSimilarity : null
    };

  } catch (error) {
    console.error('Error validating dream authenticity:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    return {
      success: false,
      error: `Authenticity check failed: ${error.message}`
    };
  }
};

/**
 * Generates a dream image using Stability AI and uploads it to Firebase Storage.
 * @param {string} dreamDescription - Text description to generate the image from.
 * @param {string} [stylePreference='surreal'] - Preferred artistic style.
 * @returns {Promise<object>} Result object with image URL and storage path or error.
 */
export const generateDreamImage = async (dreamDescription, stylePreference = 'surreal') => {
  console.log(`Generating dream image with style: ${stylePreference}`);
  if (!STABILITY_API_KEY) {
    console.error("Stability AI API Key is missing! Check environment variables (EXPO_PUBLIC_STABILITY_API_KEY).");
    return { success: false, error: "Stability AI API Key is not configured." };
  }
   if (!dreamDescription || typeof dreamDescription !== 'string' || dreamDescription.trim().length === 0) {
     return { success: false, error: "Dream description cannot be empty for image generation." };
  }

  try {
    // Create a descriptive prompt based on style
    let promptText = `Dream visualization: ${dreamDescription}.`;
    switch (stylePreference.toLowerCase()) {
      case 'surreal':
        promptText = `Surreal dreamscape painting of: ${dreamDescription}. Salvador Dali influence, ethereal, vibrant, illogical elements, high detail.`;
        break;
      case 'realistic':
        promptText = `Photorealistic depiction of a dream scene: ${dreamDescription}. Cinematic lighting, detailed, high resolution, dramatic atmosphere.`;
        break;
      case 'abstract':
        promptText = `Abstract artistic interpretation of the feeling of dreaming about: ${dreamDescription}. Expressive colors, symbolic shapes, non-representational, textured.`;
        break;
      case 'anime':
        promptText = `Anime fantasy art style, Studio Ghibli inspired, visualizing a dream about: ${dreamDescription}. Soft colors, magical atmosphere, detailed characters or scenery.`;
        break;
      // Add more styles if needed
      default:
         promptText = `Artistic visualization of a dream about: ${dreamDescription}. Style: ${stylePreference}. Ethereal, symbolic.`;
    }

    console.log("Sending request to Stability AI...");
    const response = await axios.post(
      STABILITY_API_URL,
      {
        text_prompts: [{ text: promptText, weight: 1.0 }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        steps: 35, // More steps can improve quality but increase time/cost
        samples: 1,
        // style_preset: "fantasy-art" // Optional: Experiment with Stability presets
      },
      {
        headers: {
          'Authorization': `Bearer ${STABILITY_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
         timeout: 90000 // 90 seconds timeout for potentially long image generation
      }
    );
    console.log("Received response from Stability AI.");

    if (response.data && response.data.artifacts && response.data.artifacts.length > 0 && response.data.artifacts[0].base64) {
      const imageBase64 = response.data.artifacts[0].base64;
      // Use the corrected base64ToBlob function
      const imageBlob = base64ToBlob(imageBase64, 'image/png');

      // Upload to Firebase Storage (ensure Firebase is initialized elsewhere)
      console.log("Uploading image to Firebase Storage...");
      const storage = getStorage(); // Get storage instance
      // Create a unique path for the image
      const imagePath = `dream-images/${Date.now()}_${Math.random().toString(16).substring(2, 10)}.png`;
      const storageRef = ref(storage, imagePath);

      await uploadBytes(storageRef, imageBlob);
      const imageUrl = await getDownloadURL(storageRef);
      console.log("Image uploaded successfully:", imageUrl);

      return {
        success: true,
        imageUrl,
        storagePath: imagePath
      };
    } else {
      console.error("Stability AI response missing expected image data:", JSON.stringify(response.data, null, 2));
      throw new Error('Image generation failed or API returned no image data.');
    }

  } catch (error) {
     console.error('Error generating dream image:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
     let errorMessage = `Image generation failed: ${error.message}`;
     if (error.response && error.response.data && error.response.data.message) {
         errorMessage = `Image generation failed: ${error.response.data.message}`;
     } else if (error.code === 'ECONNABORTED') {
         errorMessage = "Image generation timed out. Please try again or check Stability AI status.";
     }
     return { success: false, error: errorMessage };
  }
};


/**
 * Analyzes dream content using OpenAI for themes, emotions, symbols, and insights.
 * @param {string} dreamText - The text description of the dream.
 * @returns {Promise<object>} Result object with structured analysis or error.
 */
export const analyzeDreamContent = async (dreamText) => {
  console.log("Analyzing dream content...");
  if (!OPENAI_API_KEY) {
    console.error("OpenAI API Key is missing! Check environment variables (EXPO_PUBLIC_OPENAI_API_KEY).");
    return { success: false, error: "OpenAI API Key is not configured." };
  }
   if (!dreamText || typeof dreamText !== 'string' || dreamText.trim().length === 0) {
     return { success: false, error: "Dream text cannot be empty for analysis." };
  }

  try {
    const prompt = `
    Analyze the following dream description in detail. Identify key elements and provide interpretations based on common dream psychology principles.

    Dream: "${dreamText}"

    Respond strictly in valid JSON format with the following structure:
    {
      "themes": ["list", "of", "main", "themes"],
      "emotions": ["list", "of", "prominent", "emotions"],
      "symbols": [
        {"symbol": "identified symbol 1", "possible_meaning": "brief interpretation 1"},
        {"symbol": "identified symbol 2", "possible_meaning": "brief interpretation 2"}
      ],
      "insights": ["potential insight 1 related to subconscious", "potential insight 2"],
      "summary": "A concise one-sentence summary of the core dream narrative or feeling."
    }
    Ensure the output is valid JSON only, without any introductory text or explanations outside the JSON structure.
    `;

    console.log("Sending request to OpenAI for content analysis...");
    const response = await axios.post(
      `${OPENAI_API_URL}chat/completions`,
      {
        model: "gpt-4", // Or gpt-3.5-turbo
        messages: [
          { role: "system", content: "You are a helpful dream analysis assistant outputting structured JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }, // Enforce JSON output
        temperature: 0.6,
        max_tokens: 600
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 45000 // 45 second timeout
      }
    );
    console.log("Received analysis response from OpenAI.");

    // Attempt to parse the JSON response
    try {
        // OpenAI should return valid JSON because of response_format, but double-check
        const analysis = JSON.parse(response.data.choices[0].message.content);
         console.log("Dream content analysis successful.");
         return {
           success: true,
           analysis // The parsed JSON object
         };
    } catch (parseError) {
        console.error("Failed to parse JSON response from OpenAI:", parseError);
        console.error("Raw OpenAI response content:", response.data.choices[0].message.content);
        // Return the raw content if parsing fails, maybe it's still useful text
        return { success: false, error: "Failed to parse dream analysis JSON response.", rawResponse: response.data.choices[0].message.content };
    }

  } catch (error) {
    console.error('Error analyzing dream content:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    return {
      success: false,
      error: `Dream analysis failed: ${error.message}`
    };
  }
};

// --- End of aiUtils.js ---
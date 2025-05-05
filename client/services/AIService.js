// src/services/AIService.js
// This would use a real API in production, we'll mock it for now

class AIService {
  // Validate if a dream description is authentic based on dream-like qualities
  async validateDream(dreamText) {
    try {
      // In a real app, this would call an ML model API
      // For now, we'll use a simple mock implementation

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Dream authenticity features to look for
      const dreamFeatures = [
        { pattern: /I (was|found myself|appeared)\s/i, weight: 0.1 },
        { pattern: /(suddenly|then|after that)/i, weight: 0.05 },
        { pattern: /(could not|couldn't) (move|run|scream|speak)/i, weight: 0.15 },
        { pattern: /(flying|falling|chasing|running)/i, weight: 0.1 },
        { pattern: /(strange|weird|bizarre|odd)/i, weight: 0.05 },
        { pattern: /(dream|dreaming|dreamt)/i, weight: -0.1 }, // Explicit mention is suspicious
        { pattern: /\b(in my dream|my dream was about)\b/i, weight: -0.1 },
        { pattern: /I (woke up|realized it was a dream)/i, weight: 0.1 },
        { pattern: /(the scene (changed|shifted)|everything (changed|transformed))/i, weight: 0.15 },
        { pattern: /(colors were (vivid|bright|unusual)|everything (glowed|shimmered))/i, weight: 0.1 },
        { pattern: /(time (was different|seemed to slow|moved quickly))/i, weight: 0.1 },
        { pattern: /(people|faces) (morphed|changed|transformed)/i, weight: 0.15 },
        { pattern: /(impossible|defied physics|unnatural)/i, weight: 0.1 },
        { pattern: /(familiar but different|recognized but wrong)/i, weight: 0.1 }
      ];

      // Text length factor - dreams are usually not extremely long and detailed
      const lengthScore = Math.min(dreamText.length / 1000, 1) * 0.2;

      // Check for dream features
      let featureScore = 0;
      let matchedFeatures = [];

      dreamFeatures.forEach(feature => {
        if (feature.pattern.test(dreamText)) {
          featureScore += feature.weight;
          matchedFeatures.push({
            type: feature.pattern.toString().replace(/[\/\^\\]/g, '').slice(0, 30) + '...',
            impact: feature.weight > 0 ? 'positive' : 'negative'
          });
        }
      });

      // Normalize feature score to 0-0.7 range
      featureScore = Math.max(0, Math.min(featureScore, 0.7));

      // Randomize a bit to simulate ML uncertainty
      const randomFactor = Math.random() * 0.1;

      // Final score calculation
      const finalScore = Math.min(featureScore + lengthScore + randomFactor, 1);

      // Generate automatic tags based on content
      const potentialTags = [
        { pattern: /(flying|float|floating|levitate|hover)/i, tag: 'flying' },
        { pattern: /(falling|fell|dropping)/i, tag: 'falling' },
        { pattern: /(chase|chasing|chased|running from|escape)/i, tag: 'chase' },
        { pattern: /(teeth|dental|mouth)/i, tag: 'teeth' },
        { pattern: /(water|ocean|sea|lake|swimming|drowning)/i, tag: 'water' },
        { pattern: /(house|home|building|room)/i, tag: 'buildings' },
        { pattern: /(family|mother|father|sister|brother|parent)/i, tag: 'family' },
        { pattern: /(school|classroom|teacher|student)/i, tag: 'school' },
        { pattern: /(work|office|job|colleague|boss)/i, tag: 'work' },
        { pattern: /(animal|creature|beast|monster)/i, tag: 'creatures' },
        { pattern: /(car|vehicle|driving|road|highway)/i, tag: 'vehicles' },
        { pattern: /(love|relationship|partner|kiss)/i, tag: 'romance' },
        { pattern: /(fear|afraid|scared|terror|horror)/i, tag: 'fear' },
        { pattern: /(lucid|aware|conscious|control)/i, tag: 'lucid' },
        { pattern: /(childhood|young|kid|past)/i, tag: 'childhood' }
      ];

      const tags = [];
      potentialTags.forEach(({ pattern, tag }) => {
        if (pattern.test(dreamText) && !tags.includes(tag)) {
          tags.push(tag);
        }
      });

      // Return validation result
      return {
        isAuthentic: finalScore >= 0.6,
        score: parseFloat(finalScore.toFixed(2)),
        confidence: parseFloat(((finalScore >= 0.6 ? finalScore : 1 - finalScore) * 100).toFixed(0)),
        reasonCode: finalScore >= 0.6 ? 'DREAM_AUTHENTIC' : 'LIKELY_FABRICATED',
        matchedFeatures: matchedFeatures.slice(0, 5), // Return top 5 features
        suggestedTags: tags,
      };
    } catch (error) {
      console.error('Dream validation error:', error);
      throw new Error('Failed to validate dream content');
    }
  }

  // Analyze dream for psychological insights and patterns
  async analyzeDream(dreamText, userDreamHistory = []) {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock emotional analysis
      const emotions = [
        { emotion: 'fear', score: 0 },
        { emotion: 'joy', score: 0 },
        { emotion: 'sadness', score: 0 },
        { emotion: 'confusion', score: 0 },
        { emotion: 'anxiety', score: 0 },
        { emotion: 'excitement', score: 0 }
      ];

      // Simple keyword matching for emotions
      const emotionPatterns = [
        { pattern: /(scared|afraid|terrified|fear|horror|terror)/i, emotion: 'fear', weight: 0.2 },
        { pattern: /(happy|joy|delighted|pleased|fun|excited)/i, emotion: 'joy', weight: 0.2 },
        { pattern: /(sad|crying|tears|depressed|miserable|upset)/i, emotion: 'sadness', weight: 0.2 },
        { pattern: /(confused|confusing|unclear|strange|weird|bizarre)/i, emotion: 'confusion', weight: 0.2 },
        { pattern: /(anxious|worried|nervous|stress|panic)/i, emotion: 'anxiety', weight: 0.2 },
        { pattern: /(thrill|exciting|adventure|amazed|wonderful)/i, emotion: 'excitement', weight: 0.2 }
      ];

      emotionPatterns.forEach(({ pattern, emotion, weight }) => {
        const matches = (dreamText.match(pattern) || []).length;
        const emotionObj = emotions.find(e => e.emotion === emotion);
        if (emotionObj) {
          emotionObj.score += matches * weight;
        }
      });

      // Normalize scores to percentages
      const totalScore = emotions.reduce((sum, e) => sum + e.score, 0) || 1;
      emotions.forEach(e => {
        e.score = parseFloat(((e.score / totalScore) * 100).toFixed(0));
      });

      // Sort by highest score
      emotions.sort((a, b) => b.score - a.score);

      // Mock recurring themes
      const themes = [
        { theme: 'Loss of control', description: 'Dreams where you cannot control your surroundings or actions' },
        { theme: 'Being chased', description: 'Dreams where you are being pursued or hunted' },
        { theme: 'Falling', description: 'Dreams where you are falling from heights' },
        { theme: 'Being unprepared', description: 'Dreams where you are faced with a task you are not prepared for' },
        { theme: 'Finding new rooms', description: 'Dreams where you discover new spaces in familiar places' },
        { theme: 'Flying', description: 'Dreams where you can fly or float in the air' }
      ];

      // Select a random set of themes
      const selectedThemes = [];
      const themePatterns = [
        { pattern: /(couldn't (control|move|run|stop|speak)|no control|helpless)/i, theme: 'Loss of control' },
        { pattern: /(chased|pursued|running from|hunting|following me|after me)/i, theme: 'Being chased' },
        { pattern: /(falling|fell|dropped|dropping|plummeting)/i, theme: 'Falling' },
        { pattern: /(test|exam|not prepared|not ready|late|missed|forgot)/i, theme: 'Being unprepared' },
        { pattern: /(new room|hidden door|secret passage|never seen before|found a room)/i, theme: 'Finding new rooms' },
        { pattern: /(fly|flying|float|floating|hovering|levitating)/i, theme: 'Flying' }
      ];

      themePatterns.forEach(({ pattern, theme }) => {
        if (pattern.test(dreamText)) {
          const themeObj = themes.find(t => t.theme === theme);
          if (themeObj && !selectedThemes.includes(themeObj)) {
            selectedThemes.push(themeObj);
          }
        }
      });

      // Ensure we have at least one theme (randomly selected if none matched)
      if (selectedThemes.length === 0) {
        selectedThemes.push(themes[Math.floor(Math.random() * themes.length)]);
      }

      // Generate a simple interpretation
      let interpretation = "Based on your dream, ";

      if (emotions[0].score > 50) {
        interpretation += `you seem to be experiencing strong feelings of ${emotions[0].emotion}. `;
      } else {
        interpretation += "your emotions appear to be mixed. ";
      }

      if (selectedThemes.length > 0) {
        interpretation += `The theme of "${selectedThemes[0].theme}" suggests you might be processing feelings related to ${selectedThemes[0].description.toLowerCase()}. `;
      }

      interpretation += "Remember that dreams often reflect our subconscious processing of daily experiences and emotions.";

      return {
        emotions: emotions,
        recurringThemes: selectedThemes,
        interpretation: interpretation,
        dreamPatterns: {
          morningDreams: Math.floor(Math.random() * 30) + 20,
          nightDreams: Math.floor(Math.random() * 40) + 40,
          lucidDreamFrequency: Math.floor(Math.random() * 15)
        }
      };
    } catch (error) {
      console.error('Dream analysis error:', error);
      throw new Error('Failed to analyze dream content');
    }
  }

  // Generate AI image based on dream description
  async generateDreamImage(dreamDescription, style = 'surreal') {
    try {
      // This would call an image generation API in a real implementation
      // For now, we'll return a placeholder image URL

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      // In a real app, you would call an image generation API like OpenAI DALL-E
      // and return the generated image URL

      // For now we'll return placeholder images
      const placeholders = [
        'https://example.com/dream-images/surreal-1.jpg',
        'https://example.com/dream-images/surreal-2.jpg',
        'https://example.com/dream-images/surreal-3.jpg',
        'https://example.com/dream-images/abstract-1.jpg',
        'https://example.com/dream-images/abstract-2.jpg',
      ];

      return {
        imageUrl: placeholders[Math.floor(Math.random() * placeholders.length)],
        prompt: `A ${style} interpretation of: ${dreamDescription.substring(0, 100)}...`,
        style: style
      };
    } catch (error) {
      console.error('Dream image generation error:', error);
      throw new Error('Failed to generate dream image');
    }
  }
}

export default new AIService();
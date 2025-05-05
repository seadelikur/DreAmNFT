// server/functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cors = require('cors')({ origin: true });
const { ethers } = require('ethers');

admin.initializeApp();

// AI Dream Validation
exports.validateDream = functions.https.onCall(async (data, context) => {
  // Ensure authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { dreamText, audioUrl } = data;
  
  if (!dreamText) {
    throw new functions.https.HttpsError('invalid-argument', 'Dream text is required');
  }
  
  try {
    // Call AI service for dream validation
    // This is a placeholder - in production you would integrate with real ML API
    const validationScore = await analyzeDreamContent(dreamText, audioUrl);
    
    return {
      isValid: validationScore > 0.7,
      score: validationScore,
      message: validationScore > 0.7 ? 'Dream validated successfully' : 'Dream does not appear to be genuine'
    };
  } catch (error) {
    console.error('Dream validation error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to validate dream');
  }
});

// Helper function for dream analysis
async function analyzeDreamContent(text, audioUrl) {
  // Placeholder for ML model integration
  // In production, this would call a proper ML service
  
  // Check for dream-like content and patterns
  const dreamKeywords = ['dream', 'sleep', 'night', 'remember', 'weird', 'strange', 'flying', 'falling'];
  const wordCount = text.toLowerCase().split(' ').length;
  const keywordMatches = dreamKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword)
  ).length;
  
  // Basic heuristic scoring
  let score = 0.5; // Base score
  
  // Adjust score based on factors
  if (wordCount > 30) score += 0.1; // Longer descriptions more likely to be real
  if (keywordMatches >= 2) score += 0.1; // Contains dream-related words
  if (audioUrl) score += 0.2; // Audio recording increases likelihood of authenticity
  
  // Random factor for demo purposes
  score += Math.random() * 0.2;
  
  return Math.min(score, 1.0); // Cap at 1.0
}

// Generate AI Dream Art
exports.generateDreamArt = functions.https.onCall(async (data, context) => {
  // Ensure authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { dreamText, style } = data;
  
  if (!dreamText) {
    throw new functions.https.HttpsError('invalid-argument', 'Dream text is required');
  }
  
  try {
    // In production, this would call an image generation API like DALL-E or Stable Diffusion
    // For this example, we'll return a placeholder image URL
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Placeholder image URL based on style
    let imageUrl;
    switch(style) {
      case 'surreal':
        imageUrl = 'https://firebasestorage.googleapis.com/v0/b/dreamnft-831df.appspot.com/o/dream-art-surreal.jpg';
        break;
      case 'fantasy':
        imageUrl = 'https://firebasestorage.googleapis.com/v0/b/dreamnft-831df.appspot.com/o/dream-art-fantasy.jpg';
        break;
      case 'abstract':
        imageUrl = 'https://firebasestorage.googleapis.com/v0/b/dreamnft-831df.appspot.com/o/dream-art-abstract.jpg';
        break;
      default:
        imageUrl = 'https://firebasestorage.googleapis.com/v0/b/dreamnft-831df.appspot.com/o/dream-art-default.jpg';
    }
    
    return {
      imageUrl,
      prompt: dreamText,
      style
    };
  } catch (error) {
    console.error('Dream art generation error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate dream art');
  }
});

// Analyze Dream Patterns
exports.analyzeDreamPatterns = functions.https.onCall(async (data, context) => {
  // Ensure authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  
  try {
    // Get user's dreams from Firestore
    const dreamsSnapshot = await admin.firestore()
      .collection('dreams')
      .where('userId', '==', userId)
      .get();
      
    if (dreamsSnapshot.empty) {
      return {
        message: 'Not enough dreams to analyze patterns',
        hasEnoughData: false
      };
    }
    
    const dreams = [];
    dreamsSnapshot.forEach(doc => {
      dreams.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Extract themes and analyze patterns
    // This is a placeholder for actual NLP analysis
    const themes = extractThemes(dreams);
    const emotions = analyzeEmotions(dreams);
    const frequency = analyzeDreamFrequency(dreams);
    
    return {
      hasEnoughData: true,
      themes,
      emotions,
      frequency,
      dreamCount: dreams.length
    };
  } catch (error) {
    console.error('Dream pattern analysis error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to analyze dream patterns');
  }
});

// Helper functions for dream analysis
function extractThemes(dreams) {
  // Placeholder for theme extraction
  // In production, this would use NLP to identify common themes
  
  const allText = dreams.map(dream => dream.description).join(' ');
  const keywords = ['flying', 'falling', 'chase', 'water', 'death', 'family', 'school', 'work'];
  
  const themes = {};
  keywords.forEach(keyword => {
    // Count occurrences
    const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
    const matches = allText.match(regex);
    if (matches) {
      themes[keyword] = matches.length;
    }
  });
  
  // Sort by frequency
  return Object.entries(themes)
    .sort((a, b) => b[1] - a[1])
    .map(([theme, count]) => ({ theme, count }));
}

function analyzeEmotions(dreams) {
  // Placeholder for emotion analysis
  // In production, this would use sentiment analysis
  
  const emotionKeywords = {
    joy: ['happy', 'joy', 'excited', 'laugh'],
    fear: ['scared', 'fear', 'terrified', 'afraid'],
    sadness: ['sad', 'cry', 'depressed', 'tears'],
    anger: ['angry', 'mad', 'furious', 'rage'],
    surprise: ['surprised', 'shock', 'unexpected', 'suddenly']
  };
  
  const emotions = {
    joy: 0,
    fear: 0,
    sadness: 0,
    anger: 0,
    surprise: 0
  };
  
  dreams.forEach(dream => {
    const text = dream.description.toLowerCase();
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          emotions[emotion]++;
        }
      });
    }
  });
  
  // Convert to percentage
  const total = Object.values(emotions).reduce((sum, val) => sum + val, 0) || 1;
  
  return Object.entries(emotions).map(([emotion, count]) => ({
    emotion,
    percentage: Math.round((count / total) * 100),
    count
  }));
}

function analyzeDreamFrequency(dreams) {
  // Analyze dream recording patterns
  
  // Get dates from dreams and count by day of week
  const dayCount = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  
  dreams.forEach(dream => {
    if (dream.createdAt) {
      const date = dream.createdAt.toDate();
      const dayOfWeek = date.getDay();
      dayCount[dayOfWeek]++;
    }
  });
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return daysOfWeek.map((day, index) => ({
    day,
    count: dayCount[index]
  }));
}

// Webhook for NFT Transactions
exports.nftTransactionWebhook = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }
    
    try {
      const { transactionHash, from, to, tokenId, contractAddress } = req.body;
      
      // Verify transaction on blockchain
      // This is a placeholder - in production you would verify with a provider
      const isValid = await verifyTransaction(transactionHash, contractAddress, tokenId);
      
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid transaction' });
      }
      
      // Update database with transaction details
      await admin.firestore().collection('nftTransactions').add({
        transactionHash,
        from,
        to,
        tokenId,
        contractAddress,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        verified: true
      });
      
      // Send notification to recipients
      await sendNFTTransferNotification(from, to, tokenId);
      
      return res.status(200).json({ success: true, message: 'Transaction recorded' });
    } catch (error) {
      console.error('NFT transaction webhook error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Helper function to verify transaction
async function verifyTransaction(hash, contractAddress, tokenId) {
  // In production, this would check the blockchain
  // For this example, we'll always return true
  return true;
}

// Helper function to send notification
async function sendNFTTransferNotification(from, to, tokenId) {
  try {
    // Get user details
    const userSnapshot = await admin.firestore().collection('users').where('walletAddress', '==', to).get();
    
    if (userSnapshot.empty) {
      console.log('Target user not found in database');
      return;
    }
    
    const user = userSnapshot.docs[0];
    const userId = user.id;
    
    // Get NFT details
    const nftSnapshot = await admin.firestore().collection('nfts').where('tokenId', '==', tokenId).get();
    
    if (nftSnapshot.empty) {
      console.log('NFT not found in database');
      return;
    }
    
    const nft = nftSnapshot.docs[0].data();
    
    // Create notification
    await admin.firestore().collection('notifications').add({
      userId,
      type: 'nftTransfer',
      title: 'New NFT Received',
      message: `You've received "${nft.title}" NFT in your wallet`,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      data: {
        nftId: nftSnapshot.docs[0].id,
        tokenId,
        from
      }
    });
    
    // Send push notification if device token exists
    const deviceToken = user.data().deviceToken;
    if (deviceToken) {
      await admin.messaging().send({
        token: deviceToken,
        notification: {
          title: 'New NFT Received',
          body: `You've received "${nft.title}" NFT in your wallet`
        },
        data: {
          type: 'nftTransfer',
          nftId: nftSnapshot.docs[0].id
        }
      });
    }
  } catch (error) {
    console.error('Failed to send NFT transfer notification:', error);
  }
}
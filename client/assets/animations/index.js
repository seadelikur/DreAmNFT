// assets/animations/index.js

// This file provides access to all the animation files used in the app
// These would typically be Lottie animation JSON files

export const animations = {
  // Onboarding animations
  welcome: require('./onboarding/welcome.json'),
  dreamCreation: require('./onboarding/dream_creation.json'),
  nftMinting: require('./onboarding/nft_minting.json'),
  marketplace: require('./onboarding/marketplace.json'),

  // App animations
  loading: require('./app/loading.json'),
  success: require('./app/success.json'),
  error: require('./app/error.json'),
  empty: require('./app/empty.json'),

  // Features animations
  recordDream: require('./features/record_dream.json'),
  mintNFT: require('./features/mint_nft.json'),
  listingSuccess: require('./features/listing_success.json'),
  dreamValidation: require('./features/dream_validation.json'),

  // Dream-related animations
  dreamCloud: require('./dreams/dream_cloud.json'),
  dreamSleep: require('./dreams/dream_sleep.json'),
  dreamAnalysis: require('./dreams/dream_analysis.json'),

  // For transitions and microinteractions
  pulse: require('./micro/pulse.json'),
  wave: require('./micro/wave.json'),
  sparkle: require('./micro/sparkle.json'),
  confetti: require('./micro/confetti.json'),
};

// Example animation JSON (simplified for demo purposes)
export const sampleAnimationJSON = {
  "v": "5.7.4",
  "fr": 30,
  "ip": 0,
  "op": 60,
  "w": 400,
  "h": 400,
  "nm": "Dream Cloud Animation",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Cloud Shape",
      "sr": 1,
      "ks": {
        "o": {
          "a": 1,
          "k": [
            {
              "i": { "x": [0.667], "y": [1] },
              "o": { "x": [0.333], "y": [0] },
              "t": 0,
              "s": [50]
            },
            {
              "i": { "x": [0.667], "y": [1] },
              "o": { "x": [0.333], "y": [0] },
              "t": 30,
              "s": [100]
            },
            {
              "t": 60,
              "s": [50]
            }
          ]
        },
        "r": { "a": 0, "k": 0 },
        "p": { "a": 0, "k": [200, 200, 0] },
        "a": { "a": 0, "k": [0, 0, 0] },
        "s": {
          "a": 1,
          "k": [
            {
              "i": { "x": [0.667, 0.667, 0.667], "y": [1, 1, 1] },
              "o": { "x": [0.333, 0.333, 0.333], "y": [0, 0, 0] },
              "t": 0,
              "s": [95, 95, 100]
            },
            {
              "i": { "x": [0.667, 0.667, 0.667], "y": [1, 1, 1] },
              "o": { "x": [0.333, 0.333, 0.333], "y": [0, 0, 0] },
              "t": 30,
              "s": [105, 105, 100]
            },
            {
              "t": 60,
              "s": [95, 95, 100]
            }
          ]
        }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "d": 1,
              "ty": "el",
              "s": { "a": 0, "k": [150, 100] },
              "p": { "a": 0, "k": [0, 0] }
            },
            {
              "ty": "fl",
              "c": { "a": 0, "k": [0.416, 0.051, 0.678, 1] },
              "o": { "a": 0, "k": 100 }
            },
            {
              "ty": "tr",
              "p": { "a": 0, "k": [0, 0] },
              "a": { "a": 0, "k": [0, 0] },
              "s": { "a": 0, "k": [100, 100] },
              "r": { "a": 0, "k": 0 },
              "o": { "a": 0, "k": 100 }
            }
          ]
        }
      ]
    }
  ]
};
// assets/sounds/README.md

# DreAmNFT Sound Assets

This directory contains all sound effects and audio files used in the DreAmNFT application.

## UI Sounds
- button_press.mp3 - Standard button press sound
- toggle_on.mp3 - Toggle switch activation
- toggle_off.mp3 - Toggle switch deactivation
- notification.mp3 - Notification alert
- success.mp3 - Success action completed
- error.mp3 - Error or warning alert

## Dream Recording
- record_start.mp3 - Sound played when starting a dream recording
- record_stop.mp3 - Sound played when stopping a dream recording
- timer_tick.mp3 - Soft ticking during recording countdown

## NFT Related
- mint_success.mp3 - Sound played when NFT minting is successful
- nft_purchased.mp3 - Sound played when purchasing an NFT
- rarity_reveal.mp3 - Dramatic sound for revealing NFT rarity

## Dream Stations
- ambient_1.mp3 - Ambient background for dream stations
- ambient_2.mp3 - Alternative ambient background
- meditation_1.mp3 - Meditation background for dream stations
- meditation_2.mp3 - Alternative meditation background

## Transition Sounds
- screen_transition.mp3 - Used during screen transitions
- pop_in.mp3 - For elements that pop into the UI
- pop_out.mp3 - For elements that pop out of the UI
- swipe.mp3 - Sound for swipe gestures

## Sound Design Guidelines
All sounds maintain a consistent dreamlike aesthetic with the following characteristics:
- Soft attack and decay
- Ethereal quality
- Non-intrusive volume levels
- Spatial audio where appropriate
- 44.1kHz sample rate, 16-bit depth

## Implementation Notes
Sounds are loaded using the expo-av package and should be preloaded at app startup
for optimal performance. Sound volume is adjustable in user settings.
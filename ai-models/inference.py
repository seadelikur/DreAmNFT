# ai-models/inference.py
import os
import sys
import numpy as np
import tensorflow as tf
from PIL import Image
import io
import base64

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import models
from dream_validator.model import validate_dream
from image_generator.model import DreamImageGenerator

class DreamAIService:
    def __init__(self):
        self.dream_validator = None
        self.image_generator = None
        self.initialized = False

    def initialize(self):
        if self.initialized:
            return

        print("Initializing Dream AI services...")

        try:
            # Load dream validator
            print("Loading Dream Validator model...")
            # In a real implementation, this would load the actual model
            self.dream_validator = {
                "loaded": True,
                "validate": validate_dream
            }

            # Load image generator
            print("Loading Dream Image Generator model...")
            self.image_generator = DreamImageGenerator()

            self.initialized = True
            print("Dream AI services initialized successfully")
        except Exception as e:
            print(f"Error initializing AI services: {str(e)}")
            raise

    def validate_dream_text(self, dream_text, audio_url=None):
        """
        Validate if a dream description appears to be an authentic dream

        Args:
            dream_text (str): The dream description text
            audio_url (str, optional): URL to audio recording of the dream

        Returns:
            dict: Result with authenticity score and classification
        """
        if not self.initialized:
            self.initialize()

        # Process the dream text
        result = self.dream_validator["validate"](dream_text)

        # If audio is available, incorporate it into the validation
        if audio_url:
            # In a real implementation, this would analyze audio features
            # For this example, we'll just boost the score slightly if audio is provided
            result['authenticity_score'] = min(1.0, result['authenticity_score'] * 1.15)
            result['is_authentic'] = result['authenticity_score'] > 0.7

        return result

    def generate_dream_image(self, dream_text, style=None):
        """
        Generate an image based on a dream description

        Args:
            dream_text (str): The dream description text
            style (str, optional): Style for the generated image (e.g., 'surreal', 'fantasy')

        Returns:
            dict: Result with image data and metadata
        """
        if not self.initialized:
            self.initialize()

        # Modify prompt based on style
        if style:
            if style == 'surreal':
                styled_text = f"A surreal dream scene: {dream_text}, in the style of Salvador Dali"
            elif style == 'fantasy':
                styled_text = f"A fantasy dream world: {dream_text}, in the style of ethereal fantasy art"
            elif style == 'abstract':
                styled_text = f"An abstract representation of: {dream_text}, with dreamlike colors and shapes"
            else:
                styled_text = dream_text
        else:
            styled_text = dream_text

        # Generate image
        result = self.image_generator.generate_dream_image(styled_text)

        # Read image file and convert to base64
        with open(result['image_path'], 'rb') as img_file:
            img_data = img_file.read()
            img_base64 = base64.b64encode(img_data).decode('utf-8')

        return {
            'image_base64': img_base64,
            'dream_text': dream_text,
            'style': style or 'default',
            'image_path': result['image_path']
        }

    def analyze_dream_themes(self, dream_text):
        """
        Analyze dream content to identify themes and emotions

        Args:
            dream_text (str): The dream description text

        Returns:
            dict: Analysis results with themes, emotions, and significance
        """
        if not self.initialized:
            self.initialize()

        # This is a simplified implementation
        # In a real application, this would use NLP models for theme extraction

        # Define theme keywords
        themes = {
            'flying': ['fly', 'flying', 'float', 'levitate', 'air'],
            'falling': ['fall', 'falling', 'drop', 'plummet'],
            'chase': ['chase', 'run', 'pursue', 'follow', 'escape'],
            'water': ['water', 'ocean', 'sea', 'swim', 'drown', 'river', 'lake'],
            'death': ['death', 'die', 'dead', 'funeral', 'grave'],
            'family': ['family', 'mother', 'father', 'parent', 'brother', 'sister', 'child'],
            'school': ['school', 'class', 'exam', 'test', 'teacher', 'student'],
            'work': ['work', 'job', 'office', 'boss', 'colleague']
        }

        # Define emotion keywords
        emotions = {
            'joy': ['happy', 'joy', 'excited', 'laugh', 'pleasure'],
            'fear': ['fear', 'scared', 'terrified', 'afraid', 'horror'],
            'sadness': ['sad', 'unhappy', 'depressed', 'cry', 'tears'],
            'anger': ['angry', 'mad', 'furious', 'rage', 'upset'],
            'surprise': ['surprise', 'shocked', 'unexpected', 'astonish'],
            'anxiety': ['anxious', 'worry', 'stress', 'tension', 'nervous']
        }

        # Initialize results
        dream_text_lower = dream_text.lower()
        theme_results = []
        emotion_results = []

        # Check for themes
        for theme, keywords in themes.items():
            score = sum(1 for keyword in keywords if keyword in dream_text_lower)
            if score > 0:
                theme_results.append({
                    'theme': theme,
                    'relevance': min(score / 2, 1.0)  # Normalize score between 0 and 1
                })

        # Check for emotions
        for emotion, keywords in emotions.items():
            score = sum(1 for keyword in keywords if keyword in dream_text_lower)
            if score > 0:
                emotion_results.append({
                    'emotion': emotion,
                    'intensity': min(score / 2, 1.0)  # Normalize score between 0 and 1
                })

        # Sort results by relevance/intensity
        theme_results.sort(key=lambda x: x['relevance'], reverse=True)
        emotion_results.sort(key=lambda x: x['intensity'], reverse=True)

        # Provide dream significance (simple implementation)
        significance = "This dream may reflect your subconscious thoughts and emotions."
        if theme_results:
            top_theme = theme_results[0]['theme']
            significance += f" The presence of {top_theme} suggests you may be dealing with "

            if top_theme == 'flying':
                significance += "a desire for freedom or escape from constraints."
            elif top_theme == 'falling':
                significance += "a lack of control or insecurity in some aspect of your life."
            elif top_theme == 'chase':
                significance += "avoidance of a problem or fear that needs to be confronted."
            elif top_theme == 'water':
                significance += "emotions or the unconscious mind."
            elif top_theme == 'death':
                significance += "transformation, endings, or significant life changes."
            elif top_theme == 'family':
                significance += "your relationships and connections to others."
            elif top_theme == 'school':
                significance += "feelings of being tested or evaluated in your life."
            elif top_theme == 'work':
                significance += "your ambitions, responsibilities, or sense of purpose."

        return {
            'themes': theme_results,
            'emotions': emotion_results,
            'significance': significance,
            'dream_text': dream_text
        }

# Create singleton instance
dream_ai_service = DreamAIService()

# API functions for external use
def validate_dream_api(dream_text, audio_url=None):
    return dream_ai_service.validate_dream_text(dream_text, audio_url)

def generate_dream_image_api(dream_text, style=None):
    return dream_ai_service.generate_dream_image(dream_text, style)

def analyze_dream_themes_api(dream_text):
    return dream_ai_service.analyze_dream_themes(dream_text)

if __name__ == "__main__":
    # Test the API functions
    dream_text = "I was flying over a city with rainbow-colored buildings, but suddenly I started falling and couldn't stop."

    print("\nTesting Dream Validation:")
    validation_result = validate_dream_api(dream_text)
    print(f"Is authentic: {validation_result['is_authentic']}")
    print(f"Authenticity score: {validation_result['authenticity_score']:.2f}")

    print("\nTesting Dream Image Generation:")
    image_result = generate_dream_image_api(dream_text, style="surreal")
    print(f"Image generated at: {image_result['image_path']}")

    print("\nTesting Dream Theme Analysis:")
    analysis_result = analyze_dream_themes_api(dream_text)
    print("Themes:")
    for theme in analysis_result['themes']:
        print(f"- {theme['theme']} (relevance: {theme['relevance']:.2f})")
    print("Emotions:")
    for emotion in analysis_result['emotions']:
        print(f"- {emotion['emotion']} (intensity: {emotion['intensity']:.2f})")
    print(f"Significance: {analysis_result['significance']}")
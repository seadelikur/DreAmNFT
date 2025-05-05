# ai-models/dream-validator/model.py
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense, Dropout, Bidirectional
from sklearn.model_selection import train_test_split

# Load training data
# This would typically be a dataset of real dreams vs fake/generated texts
def load_dream_dataset():
    # In a real application, this would load from a CSV or database
    # For this example, we'll create a synthetic dataset
    real_dreams = [
        "I was flying over a city I didn't recognize, yet somehow felt familiar.",
        "My teeth were falling out one by one, and I kept collecting them in my hand.",
        "I was back in my childhood home, but all the rooms were in the wrong places.",
        "I was being chased through a forest by something I couldn't see but terrified me.",
        "I was at a party with people I know, but they kept changing into different people.",
        # More examples would be included
    ]

    fake_dreams = [
        "I dreamed about winning the lottery with the numbers 7, 14, 22, 35, 41.",
        "Had a dream about the stock market going up tomorrow by exactly 3.2%.",
        "I dreamed about a new invention that solves world hunger using quantum physics.",
        "My dream showed me exactly who will win the election next year.",
        "Dreamed about aliens telling me the meaning of life is 42.",
        # More examples would be included
    ]

    # Create labels (1 for real dreams, 0 for fake)
    real_labels = np.ones(len(real_dreams))
    fake_labels = np.zeros(len(fake_dreams))

    # Combine data
    all_dreams = real_dreams + fake_dreams
    all_labels = np.concatenate([real_labels, fake_labels])

    return all_dreams, all_labels

# Preprocess text data
def preprocess_text(texts, max_words=10000, max_sequence_length=100):
    tokenizer = Tokenizer(num_words=max_words, oov_token="<OOV>")
    tokenizer.fit_on_texts(texts)

    sequences = tokenizer.texts_to_sequences(texts)
    padded_sequences = pad_sequences(sequences, maxlen=max_sequence_length, padding='post')

    # Save tokenizer for inference
    import pickle
    with open('ai-models/dream-validator/tokenizer.pickle', 'wb') as handle:
        pickle.dump(tokenizer, handle, protocol=pickle.HIGHEST_PROTOCOL)

    return padded_sequences, tokenizer

# Build and train model
def build_and_train_model():
    # Load data
    dream_texts, labels = load_dream_dataset()

    # Preprocess data
    padded_sequences, tokenizer = preprocess_text(dream_texts)

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        padded_sequences, labels, test_size=0.2, random_state=42
    )

    # Build model
    embedding_dim = 128
    vocab_size = len(tokenizer.word_index) + 1

    model = Sequential([
        Embedding(vocab_size, embedding_dim),
        Bidirectional(LSTM(64, return_sequences=True)),
        Bidirectional(LSTM(32)),
        Dense(64, activation='relu'),
        Dropout(0.5),
        Dense(1, activation='sigmoid')
    ])

    model.compile(loss='binary_crossentropy',
                  optimizer='adam',
                  metrics=['accuracy'])

    # Train model
    history = model.fit(
        X_train, y_train,
        epochs=20,
        validation_data=(X_test, y_test),
        verbose=1
    )

    # Evaluate model
    loss, accuracy = model.evaluate(X_test, y_test)
    print(f"Test Accuracy: {accuracy:.4f}")

    # Save model
    model.save('ai-models/dream-validator/dream_validator_model.h5')

    return model, history

# Function to use model for inference
def validate_dream(dream_text):
    # Load tokenizer
    import pickle
    with open('ai-models/dream-validator/tokenizer.pickle', 'rb') as handle:
        tokenizer = pickle.load(handle)

    # Load model
    model = tf.keras.models.load_model('ai-models/dream-validator/dream_validator_model.h5')

    # Preprocess input
    sequence = tokenizer.texts_to_sequences([dream_text])
    padded = pad_sequences(sequence, maxlen=100, padding='post')

    # Make prediction
    prediction = model.predict(padded)[0][0]

    # Return result
    authenticity_score = float(prediction)
    is_authentic = authenticity_score > 0.7

    return {
        'is_authentic': is_authentic,
        'authenticity_score': authenticity_score,
        'dream_text': dream_text
    }

if __name__ == "__main__":
    print("Starting Dream Validator Model Training...")
    model, history = build_and_train_model()
    print("Training completed and model saved!")

    # Test with a sample dream
    test_dream = "I was flying over a beautiful ocean, and suddenly my arms turned into wings."
    result = validate_dream(test_dream)
    print(f"Test Dream: {test_dream}")
    print(f"Authenticity: {result['authenticity_score']:.2f}")
    print(f"Is Authentic: {result['is_authentic']}")
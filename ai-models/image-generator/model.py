# ai-models/image-generator/model.py
import tensorflow as tf
from tensorflow.keras import layers
import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import time
import os

# This is a simplified implementation of a text-to-image generator
# In a production environment, you would use more advanced models like DALL-E or Stable Diffusion

class DreamImageGenerator:
    def __init__(self):
        self.latent_dim = 128
        self.text_embedding_dim = 256
        self.image_size = 64

        # Text processing
        self.max_text_length = 100
        self.tokenizer = None
        self.vocab_size = 10000

        # Models
        self.text_encoder = None
        self.generator = None
        self.discriminator = None
        self.gan = None

        # Build models
        self._build_text_encoder()
        self._build_generator()
        self._build_discriminator()
        self._build_gan()

    def _build_text_encoder(self):
        """Build model to encode text descriptions"""
        input_text = layers.Input(shape=(self.max_text_length,))

        embedding = layers.Embedding(
            input_dim=self.vocab_size,
            output_dim=self.text_embedding_dim
        )(input_text)

        lstm = layers.Bidirectional(
            layers.LSTM(128, return_sequences=True)
        )(embedding)

        lstm = layers.Bidirectional(
            layers.LSTM(128)
        )(lstm)

        dense = layers.Dense(256, activation='relu')(lstm)
        output = layers.Dense(self.latent_dim)(dense)

        self.text_encoder = tf.keras.Model(input_text, output, name='text_encoder')

    def _build_generator(self):
        """Build generator model to create images from encoded text"""
        latent = layers.Input(shape=(self.latent_dim,))

        x = layers.Dense(4 * 4 * 256, use_bias=False)(latent)
        x = layers.BatchNormalization()(x)
        x = layers.LeakyReLU()(x)

        x = layers.Reshape((4, 4, 256))(x)

        # Upsampling layers
        x = layers.Conv2DTranspose(128, (5, 5), strides=(2, 2), padding='same', use_bias=False)(x)
        x = layers.BatchNormalization()(x)
        x = layers.LeakyReLU()(x)

        x = layers.Conv2DTranspose(64, (5, 5), strides=(2, 2), padding='same', use_bias=False)(x)
        x = layers.BatchNormalization()(x)
        x = layers.LeakyReLU()(x)

        x = layers.Conv2DTranspose(32, (5, 5), strides=(2, 2), padding='same', use_bias=False)(x)
        x = layers.BatchNormalization()(x)
        x = layers.LeakyReLU()(x)

        x = layers.Conv2DTranspose(3, (5, 5), strides=(2, 2), padding='same', use_bias=False, activation='tanh')(x)

        self.generator = tf.keras.Model(latent, x, name='generator')

    def _build_discriminator(self):
        """Build discriminator model to distinguish real vs generated images"""
        input_image = layers.Input(shape=(self.image_size, self.image_size, 3))
        input_text = layers.Input(shape=(self.latent_dim,))

        # Image processing
        x = layers.Conv2D(64, (5, 5), strides=(2, 2), padding='same')(input_image)
        x = layers.LeakyReLU()(x)

        x = layers.Conv2D(128, (5, 5), strides=(2, 2), padding='same')(x)
        x = layers.LeakyReLU()(x)

        x = layers.Conv2D(256, (5, 5), strides=(2, 2), padding='same')(x)
        x = layers.LeakyReLU()(x)

        x = layers.Flatten()(x)

        # Combine with text
        text_features = layers.Dense(256, activation='relu')(input_text)
        x = layers.Concatenate()([x, text_features])

        x = layers.Dense(512, activation='relu')(x)
        x = layers.Dense(1)(x)

        self.discriminator = tf.keras.Model([input_image, input_text], x, name='discriminator')

    def _build_gan(self):
        """Combine generator and discriminator into GAN"""
        self.discriminator.trainable = False

        latent_input = layers.Input(shape=(self.latent_dim,))
        text_input = layers.Input(shape=(self.latent_dim,))

        generated_image = self.generator(latent_input)
        validity = self.discriminator([generated_image, text_input])

        self.gan = tf.keras.Model([latent_input, text_input], validity, name='gan')
        self.gan.compile(loss='binary_crossentropy', optimizer=tf.keras.optimizers.Adam())

    def train(self, dream_texts, dream_images, epochs=1000, batch_size=32):
        """Train the model on dream texts and corresponding images"""
        # Initialize tokenizer
        self.tokenizer = Tokenizer(num_words=self.vocab_size, oov_token="<OOV>")
        self.tokenizer.fit_on_texts(dream_texts)

        # Save tokenizer
        import pickle
        with open('ai-models/image-generator/tokenizer.pickle', 'wb') as handle:
            pickle.dump(self.tokenizer, handle, protocol=pickle.HIGHEST_PROTOCOL)

        # Process text
        sequences = self.tokenizer.texts_to_sequences(dream_texts)
        padded_texts = pad_sequences(sequences, maxlen=self.max_text_length, padding='post')

        # Normalize images
        normalized_images = (dream_images / 127.5) - 1.0

        # Create directory for saving samples
        os.makedirs('ai-models/image-generator/samples', exist_ok=True)

        valid = np.ones((batch_size, 1))
        fake = np.zeros((batch_size, 1))

        for epoch in range(epochs):
            # ---------------------
            #  Train Discriminator
            # ---------------------

            # Select a random batch of dream descriptions
            idx = np.random.randint(0, padded_texts.shape[0], batch_size)
            texts = padded_texts[idx]
            images = normalized_images[idx]

            # Encode text descriptions
            encoded_texts = self.text_encoder.predict(texts)

            # Sample noise for generator input
            noise = np.random.normal(0, 1, (batch_size, self.latent_dim))

            # Generate a batch of new images
            gen_images = self.generator.predict(noise)

            # Train the discriminator
            d_loss_real = self.discriminator.train_on_batch([images, encoded_texts], valid)
            d_loss_fake = self.discriminator.train_on_batch([gen_images, encoded_texts], fake)
            d_loss = 0.5 * np.add(d_loss_real, d_loss_fake)

            # ---------------------
            #  Train Generator
            # ---------------------

            # Train the generator
            g_loss = self.gan.train_on_batch([noise, encoded_texts], valid)

            # Print progress
            if epoch % 100 == 0:
                print(f"{epoch} [D loss: {d_loss}] [G loss: {g_loss}]")
                self.save_samples(epoch)

        # Save models after training
        self.text_encoder.save('ai-models/image-generator/text_encoder.h5')
        self.generator.save('ai-models/image-generator/generator.h5')
        self.discriminator.save('ai-models/image-generator/discriminator.h5')

    def save_samples(self, epoch):
        """Save sample generated images during training"""
        r, c = 3, 3
        noise = np.random.normal(0, 1, (r * c, self.latent_dim))

        # Sample random dream descriptions and encode them
        sample_texts = [
            "I was flying over a beautiful landscape",
            "My teeth were falling out one by one",
            "I was running but couldn't move forward",
            "I was back in my childhood home",
            "I could breathe underwater like a fish",
            "I was trapped in a maze with no exit",
            "I had a conversation with a deceased relative",
            "I was performing on stage in front of thousands",
            "I discovered a hidden room in my house"
        ]

        sequences = self.tokenizer.texts_to_sequences(sample_texts)
        padded_texts = pad_sequences(sequences, maxlen=self.max_text_length, padding='post')
        encoded_texts = self.text_encoder.predict(padded_texts)

        gen_imgs = self.generator.predict(encoded_texts)

        # Rescale images 0 - 1
        gen_imgs = 0.5 * gen_imgs + 0.5

        fig, axs = plt.subplots(r, c, figsize=(15, 15))
        cnt = 0
        for i in range(r):
            for j in range(c):
                axs[i, j].imshow(gen_imgs[cnt])
                axs[i, j].set_title(sample_texts[cnt][:20] + "...")
                axs[i, j].axis('off')
                cnt += 1

        fig.savefig(f"ai-models/image-generator/samples/dream_{epoch}.png")
        plt.close()

    def generate_dream_image(self, dream_text):
        """Generate an image from a dream description"""
        # Load models if not already loaded
        if self.tokenizer is None:
            import pickle
            with open('ai-models/image-generator/tokenizer.pickle', 'rb') as handle:
                self.tokenizer = pickle.load(handle)

        # Process text
        sequence = self.tokenizer.texts_to_sequences([dream_text])
        padded_text = pad_sequences(sequence, maxlen=self.max_text_length, padding='post')

        # Encode text
        encoded_text = self.text_encoder.predict(padded_text)

        # Generate image
        generated_image = self.generator.predict(encoded_text)

        # Rescale image
        generated_image = 0.5 * generated_image[0] + 0.5

        # Save image
        timestamp = int(time.time())
        filename = f'ai-models/image-generator/output/dream_{timestamp}.png'
        os.makedirs('ai-models/image-generator/output', exist_ok=True)
        plt.imsave(filename, generated_image)

        return {
            'image_path': filename,
            'dream_text': dream_text
        }

def download_dream_dataset():
    """
    In a real implementation, this would download or access a dataset of paired
    dream descriptions and images. For this example, we'll create synthetic data.
    """
    print("Downloading dream dataset (simulated)...")

    # Create synthetic data
    num_samples = 1000

    # Generate random images (64x64x3)
    images = np.random.rand(num_samples, 64, 64, 3)

    # Sample dream descriptions
    dream_descriptions = [
        f"Dream sample {i}: " + np.random.choice([
            "Flying over mountains and lakes",
            "Falling from a tall building",
            "Swimming underwater and breathing normally",
            "Being chased by an unknown entity",
            "Finding a hidden room in my house",
            "Meeting a deceased relative",
            "Teeth falling out one by one",
            "Unable to run or move quickly",
            "Back in school taking an exam I didn't study for",
            "Having supernatural abilities"
        ]) for i in range(num_samples)
    ]

    print(f"Dataset created with {num_samples} samples")
    return dream_descriptions, images

if __name__ == "__main__":
    print("Starting Dream Image Generator Model Training...")

    # Get dataset
    dream_texts, dream_images = download_dream_dataset()

    # Initialize and train model
    dream_generator = DreamImageGenerator()
    dream_generator.train(dream_texts, dream_images, epochs=200, batch_size=32)

    print("Training completed and model saved!")

    # Test with a sample dream
    test_dream = "I was flying over a city with rainbow-colored buildings"
    result = dream_generator.generate_dream_image(test_dream)
    print(f"Test Dream: {test_dream}")
    print(f"Image saved to: {result['image_path']}")
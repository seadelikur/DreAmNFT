// src/components/MintNFTForm.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../styles/theme';
import { useApp } from '../context/AppContext';
import { mintDreamNFT } from '../utils/blockchainUtils';
import { uploadToIPFS } from '../utils/ipfsUtils';
import RaritySelector from './RaritySelector';

const MintNFTForm = ({ dream, onSuccess, onCancel }) => {
  const { walletConnected, walletAddress, userProfile } = useApp();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(dream?.title || '');
  const [description, setDescription] = useState(dream?.description || '');
  const [rarity, setRarity] = useState(0); // 0 = Common
  const [mintingFee, setMintingFee] = useState('0.001');
  const [transactionHash, setTransactionHash] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (dream) {
      setTitle(dream.title || '');
      setDescription(dream.description || '');
    }
  }, [dream]);

  const handleMint = async () => {
    if (!walletConnected) {
      Alert.alert(
        'Wallet Not Connected',
        'Please connect your wallet first.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title for your NFT');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Upload metadata to IPFS
      const metadata = {
        name: title,
        description: description,
        image: dream.imageUrl || '',
        audio: dream.audioUrl || '',
        attributes: [
          {
            trait_type: 'Rarity',
            value: getRarityLabel(rarity)
          },
          {
            trait_type: 'Author',
            value: userProfile.username || walletAddress.substring(0, 6)
          },
          {
            trait_type: 'Recorded Date',
            value: new Date(dream.createdAt).toISOString().split('T')[0]
          }
        ],
        properties: {
          dreamId: dream.id,
          authorId: userProfile.uid,
          tags: dream.tags || [],
          emotions: dream.emotions || []
        }
      };

      const { success: ipfsSuccess, uri } = await uploadToIPFS(metadata);

      if (!ipfsSuccess || !uri) {
        throw new Error('Failed to upload metadata to IPFS');
      }

      setStep(2);

      // Step 2: Mint NFT
      const { success, tokenId, transactionHash: txHash } = await mintDreamNFT(
        dream.id,
        title,
        uri,
        rarity,
        walletAddress
      );

      if (!success) {
        throw new Error('Failed to mint NFT');
      }

      setTransactionHash(txHash);
      setStep(3);

      // Step 3: Update dream record in Firebase
      const dreamData = {
        isNFT: true,
        tokenId: tokenId,
        tokenURI: uri,
        contractAddress: contractAddress, // From your contract deployment
        mintedAt: new Date().toISOString(),
        transactionHash: txHash,
        rarity: rarity
      };

      // Update the dream in Firebase (handled by onSuccess callback)
      onSuccess(dreamData);

    } catch (error) {
      console.error('Error minting NFT:', error);
      setError(error.message || 'Failed to mint NFT. Please try again.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const getRarityLabel = (rarityValue) => {
    const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
    return rarities[rarityValue] || 'Common';
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepContainer}>
        <View style={[styles.stepIndicator, step >= 1 && styles.activeStep]}>
          <Text style={[styles.stepNumber, step >= 1 && styles.activeStepNumber]}>1</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.stepIndicator, step >= 2 && styles.activeStep]}>
          <Text style={[styles.stepNumber, step >= 2 && styles.activeStepNumber]}>2</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.stepIndicator, step >= 3 && styles.activeStep]}>
          <Text style={[styles.stepNumber, step >= 3 && styles.activeStepNumber]}>3</Text>
        </View>
      </View>
    );
  };

  const renderStep1 = () => {
    return (
      <View>
        <Text style={styles.stepTitle}>Prepare Your Dream NFT</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>NFT Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter a title for your NFT"
            placeholderTextColor={colors.textSecondary}
            maxLength={50}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your dream (optional)"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Rarity</Text>
          <RaritySelector
            selectedRarity={rarity}
            onSelectRarity={setRarity}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => setStep(2)}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStep2 = () => {
    return (
      <View>
        <Text style={styles.stepTitle}>Confirm Minting</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Dream NFT Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Title:</Text>
            <Text style={styles.summaryValue}>{title}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rarity:</Text>
            <Text style={styles.summaryValue}>{getRarityLabel(rarity)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Minting Fee:</Text>
            <Text style={styles.summaryValue}>{mintingFee} ETH</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Wallet:</Text>
            <Text style={styles.summaryValue}>
              {walletAddress ?
                `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` :
                'Not connected'}
            </Text>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          By minting this NFT, you confirm that you own the rights to this dream and agree to the terms of service. The minting process will create a transaction on the blockchain which cannot be reversed.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setStep(1)}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mintButton, loading && styles.disabledButton]}
            onPress={handleMint}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.mintButtonText}>Mint NFT</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStep3 = () => {
    return (
      <View style={styles.successContainer}>
        <Ionicons name="checkmark-circle" size={80} color={colors.success} />
        <Text style={styles.successTitle}>NFT Minted Successfully!</Text>

        <View style={styles.transactionContainer}>
          <Text style={styles.transactionLabel}>Transaction Hash:</Text>
          <Text style={styles.transactionHash}>
            {`${transactionHash.substring(0, 20)}...${transactionHash.substring(transactionHash.length - 4)}`}
          </Text>
          <TouchableOpacity style={styles.viewTransactionButton}>
            <Text style={styles.viewTransactionText}>View on Etherscan</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.successMessage}>
          Your dream has been successfully minted as an NFT. It may take a few minutes for the transaction to be confirmed on the blockchain.
        </Text>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={onSuccess}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderStepIndicator()}

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeStep: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepNumber: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  activeStepNumber: {
    color: 'white',
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  stepTitle: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  continueButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: 'white',
  },
  mintButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mintButtonText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: 'white',
  },
  disabledButton: {
    backgroundColor: colors.primaryLight,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  disclaimer: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.error,
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    alignItems: 'center',
    padding: 16,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.text,
    marginTop: 16,
    marginBottom: 24,
  },
  transactionContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  transactionLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  transactionHash: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
    marginBottom: 12,
  },
  viewTransactionButton: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  viewTransactionText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.primary,
  },
  successMessage: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: 'white',
  },
});

export default MintNFTForm;
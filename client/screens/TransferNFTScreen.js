// screens/TransferNFTScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ethers } from 'ethers';
import { transferNFT } from '../utils/nftUtils';
import { auth, firestore } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

const TransferNFTScreen = ({ route, navigation }) => {
  const { tokenId, contractAddress } = route.params;
  const [recipientAddress, setRecipientAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [addressError, setAddressError] = useState('');
  const currentUser = auth.currentUser;

  const validateEthereumAddress = (address) => {
    try {
      const isValid = ethers.utils.isAddress(address);
      return isValid;
    } catch (error) {
      return false;
    }
  };

  const handleAddressChange = (text) => {
    setRecipientAddress(text);
    if (text && !validateEthereumAddress(text)) {
      setAddressError('Invalid Ethereum address');
    } else {
      setAddressError('');
    }
  };

  const handleTransfer = async () => {
    if (!validateEthereumAddress(recipientAddress)) {
      setAddressError('Invalid Ethereum address');
      return;
    }

    setLoading(true);
    try {
      // Perform transfer on blockchain
      const result = await transferNFT(
        tokenId,
        currentUser.uid, // In a real app, this would be the wallet address
        recipientAddress
      );

      // Update Firestore record
      // In a real app, you would listen for blockchain events to confirm transfer
      // For demo, we'll just update the database

      Alert.alert(
        "Transfer Successful",
        `Your NFT has been transferred to ${recipientAddress}`,
        [
          { text: "OK", onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      console.error('Transfer error:', error);
      Alert.alert(
        "Transfer Failed",
        error.message || "There was a problem transferring your NFT"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoCard}>
        <MaterialCommunityIcons name="information-outline" size={24} color="#6200ee" />
        <Text style={styles.infoText}>
          You are about to transfer your NFT. This action cannot be undone.
          Make sure the recipient address is correct.
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>NFT ID</Text>
        <View style={styles.readOnlyInput}>
          <Text style={styles.readOnlyText}>{tokenId}</Text>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Contract Address</Text>
        <View style={styles.readOnlyInput}>
          <Text style={styles.readOnlyText} numberOfLines={1} ellipsizeMode="middle">
            {contractAddress}
          </Text>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Recipient Address</Text>
        <TextInput
          style={[styles.input, addressError ? styles.inputError : null]}
          placeholder="0x..."
          value={recipientAddress}
          onChangeText={handleAddressChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {addressError ? <Text style={styles.errorText}>{addressError}</Text> : null}
      </View>

      <TouchableOpacity
        style={[
          styles.transferButton,
          (!recipientAddress || addressError || loading) && styles.disabledButton
        ]}
        onPress={handleTransfer}
        disabled={!recipientAddress || !!addressError || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <MaterialCommunityIcons name="send" size={20} color="#fff" />
            <Text style={styles.buttonText}>Transfer NFT</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#e91e63',
  },
  errorText: {
    fontSize: 12,
    color: '#e91e63',
    marginTop: 4,
  },
  readOnlyInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  readOnlyText: {
    fontSize: 16,
    color: '#666',
  },
  transferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200ee',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 12,
  },
  cancelText: {
    fontSize: 16,
    color: '#6200ee',
    fontWeight: '600',
  },
});

export default TransferNFTScreen;
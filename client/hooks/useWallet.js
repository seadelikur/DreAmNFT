// hooks/useWallet.js
import { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '../AppContext';
import ApiEndpoints from '../constants/ApiEndpoints';

export default function useWallet() {
  const { walletState, setWalletState } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize provider
  const getProvider = () => {
    return new ethers.providers.JsonRpcProvider(ApiEndpoints.BLOCKCHAIN.RPC_URL);
  };

  // Connect wallet using private key
  const connectWallet = async (privateKey) => {
    setLoading(true);
    setError(null);
    try {
      const provider = getProvider();
      const wallet = new ethers.Wallet(privateKey, provider);
      const address = await wallet.getAddress();
      const balance = await provider.getBalance(address);

      // Save wallet to state and secure storage
      setWalletState({
        connected: true,
        address,
        balance: ethers.utils.formatEther(balance),
        privateKey
      });

      await AsyncStorage.setItem('walletPrivateKey', privateKey);
      setLoading(false);
      return { address, balance: ethers.utils.formatEther(balance) };
    } catch (err) {
      setError('Failed to connect wallet: ' + err.message);
      setLoading(false);
      throw err;
    }
  };

  // Create new wallet
  const createWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const wallet = ethers.Wallet.createRandom();
      await connectWallet(wallet.privateKey);
      setLoading(false);
      return wallet;
    } catch (err) {
      setError('Failed to create wallet: ' + err.message);
      setLoading(false);
      throw err;
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem('walletPrivateKey');
      setWalletState({
        connected: false,
        address: null,
        balance: '0',
        privateKey: null
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to disconnect wallet: ' + err.message);
      setLoading(false);
      throw err;
    }
  };

  // Get transaction history
  const getTransactionHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!walletState.address) throw new Error('Wallet not connected');

      const provider = getProvider();
      const history = await provider.getHistory(walletState.address);
      setLoading(false);
      return history;
    } catch (err) {
      setError('Failed to get transaction history: ' + err.message);
      setLoading(false);
      throw err;
    }
  };

  // Refresh wallet balance
  const refreshBalance = async () => {
    if (!walletState.address) return;

    try {
      const provider = getProvider();
      const balance = await provider.getBalance(walletState.address);

      setWalletState(prev => ({
        ...prev,
        balance: ethers.utils.formatEther(balance)
      }));

      return ethers.utils.formatEther(balance);
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    }
  };

  // Auto-connect wallet from storage on component mount
  useEffect(() => {
    const autoConnectWallet = async () => {
      try {
        const savedPrivateKey = await AsyncStorage.getItem('walletPrivateKey');
        if (savedPrivateKey) {
          await connectWallet(savedPrivateKey);
        }
      } catch (err) {
        console.error('Failed to auto-connect wallet:', err);
      }
    };

    if (!walletState.connected) {
      autoConnectWallet();
    }
  }, []);

  return {
    connectWallet,
    createWallet,
    disconnectWallet,
    getTransactionHistory,
    refreshBalance,
    loading,
    error
  };
}
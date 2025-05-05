// utils/nftUtils.js
import { ethers } from 'ethers';
import { firestore } from '../firebase/config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import DreAmNFTABI from '../../artifacts/contracts/DreamNFT.sol/DreAmNFT.json';

// Replace with your contract address (Sepolia)
const NFT_CONTRACT_ADDRESS = '0x123456789abcdef123456789abcdef123456789';
const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/your-infura-key';

// Function to mint a dream as NFT
export const mintDreamAsNFT = async (dream, userId) => {
  try {
    // Update dream status to pending in Firestore
    const dreamRef = doc(firestore, 'dreams', dream.id);
    await updateDoc(dreamRef, {
      nftStatus: 'pending',
      nftStatusUpdatedAt: serverTimestamp()
    });

    // In a real app, you'd either:
    // 1. Sign transaction on the client with a wallet like MetaMask
    // 2. Use a serverless function to handle the minting securely

    // For testing purposes, we'll simulate the minting process:
    // Normally this would be a blockchain transaction

    // Wait for 2 seconds to simulate blockchain transaction time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate a fake token ID for testing
    const tokenId = Math.floor(Math.random() * 1000000);

    // Update Firestore with minted status
    await updateDoc(dreamRef, {
      nftStatus: 'minted',
      tokenId: tokenId.toString(),
      nftMintedAt: serverTimestamp(),
      nftContract: NFT_CONTRACT_ADDRESS,
      nftUrl: `https://dreamnft.app/nft/${tokenId}`
    });

    return tokenId;
  } catch (error) {
    console.error('Error minting NFT:', error);

    // Update dream with error status
    const dreamRef = doc(firestore, 'dreams', dream.id);
    await updateDoc(dreamRef, {
      nftStatus: 'error',
      nftError: error.message,
      nftStatusUpdatedAt: serverTimestamp()
    });

    throw error;
  }
};

// Function to get NFT metadata
export const getNFTMetadata = async (tokenId) => {
  try {
    // In a production app, you would:
    // 1. Connect to blockchain and fetch actual metadata
    // 2. Or fetch from IPFS/Arweave where metadata is stored

    // For testing purposes, return mock data
    return {
      name: `Dream NFT #${tokenId}`,
      description: "A unique NFT representing a recorded dream on DreAmNFT platform.",
      image: "https://picsum.photos/800/800", // Placeholder image
      contract: NFT_CONTRACT_ADDRESS,
      attributes: [
        { trait_type: "Rarity", value: "Rare" },
        { trait_type: "Category", value: "Fantasy" },
        { trait_type: "Emotion", value: "Joy" },
        { trait_type: "Clarity", value: "High" }
      ]
    };
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    throw error;
  }
};

// Function to transfer an NFT
export const transferNFT = async (tokenId, fromAddress, toAddress) => {
  try {
    // This would typically connect to user's wallet and trigger a transfer transaction
    // For demo purposes, we'll simulate the process

    // Wait for 2 seconds to simulate blockchain transaction time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In a real app, you would update Firestore to reflect the new ownership
    return {
      success: true,
      transactionHash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
    };
  } catch (error) {
    console.error('Error transferring NFT:', error);
    throw error;
  }
};
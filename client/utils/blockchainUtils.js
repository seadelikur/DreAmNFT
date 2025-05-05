// src/utils/blockchain.js
import { ethers } from 'ethers';
import DreAmNFTContract from '../../artifacts/contracts/DreamNFT.sol/DreAmNFT.json';
import DreAmMarketplaceContract from '../../artifacts/contracts/DreamMarketplace.sol/DreAmMarketplace.json';
import { getIPFSGatewayUrl } from './ipfs';

// Contract addresses (will be replaced with actual deployed addresses)
const NFT_CONTRACT_ADDRESS = '0x123...'; // Replace with actual address
const MARKETPLACE_CONTRACT_ADDRESS = '0x456...'; // Replace with actual address

// Network configurations
const NETWORKS = {
  sepolia: {
    chainId: '0xaa36a7',
    chainName: 'Sepolia Testnet',
    rpcUrls: ['https://rpc.sepolia.org'],
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ['https://sepolia.etherscan.io']
  }
};

// Initialize provider based on environment
export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }

  // Fallback to Sepolia RPC
  return new ethers.providers.JsonRpcProvider(NETWORKS.sepolia.rpcUrls[0]);
};

// Connect wallet
export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('No Ethereum wallet detected. Please install MetaMask or another compatible wallet.');
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Request account access
    const accounts = await provider.send('eth_requestAccounts', []);

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const network = await provider.getNetwork();

    // Check if we're on the correct network (Sepolia)
    if (network.chainId !== 11155111) { // Sepolia chainId
      try {
        // Try to switch to Sepolia
        await provider.send('wallet_switchEthereumChain', [{ chainId: '0xaa36a7' }]); // Sepolia chainId in hex
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await provider.send('wallet_addEthereumChain', [NETWORKS.sepolia]);
          } catch (addError) {
            throw new Error('Failed to add the Sepolia network to your wallet');
          }
        } else {
          throw new Error('Failed to switch to the Sepolia network');
        }
      }
    }

    const signer = provider.getSigner();
    const address = await signer.getAddress();

    return {
      address,
      provider,
      signer
    };
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
};

// Get NFT contract instance
export const getNFTContract = (signerOrProvider) => {
  return new ethers.Contract(
    NFT_CONTRACT_ADDRESS,
    DreAmNFTContract.abi,
    signerOrProvider
  );
};

// Get marketplace contract instance
export const getMarketplaceContract = (signerOrProvider) => {
  return new ethers.Contract(
    MARKETPLACE_CONTRACT_ADDRESS,
    DreAmMarketplaceContract.abi,
    signerOrProvider
  );
};

// Mint a new NFT
export const mintNFT = async (signer, tokenURI, royaltyPercentage = 5) => {
  try {
    const nftContract = getNFTContract(signer);

    // Royalty is represented in basis points (e.g., 5% = 500)
    const royaltyBasisPoints = royaltyPercentage * 100;

    const tx = await nftContract.mintDreamNFT(tokenURI, royaltyBasisPoints);
    const receipt = await tx.wait();

    // Find the Transfer event to get the tokenId
    const transferEvent = receipt.events.find(e => e.event === 'Transfer');
    const tokenId = transferEvent.args.tokenId.toString();

    return {
      tokenId,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('Failed to mint NFT:', error);
    throw error;
  }
};

// List NFT on marketplace
export const listNFTForSale = async (signer, tokenId, priceInEth) => {
  try {
    const nftContract = getNFTContract(signer);
    const marketplaceContract = getMarketplaceContract(signer);

    // First approve the marketplace to transfer the NFT
    const approveTx = await nftContract.approve(MARKETPLACE_CONTRACT_ADDRESS, tokenId);
    await approveTx.wait();

    // Convert price from ETH to wei
    const priceInWei = ethers.utils.parseEther(priceInEth.toString());

    // List the NFT for sale
    const listTx = await marketplaceContract.listDreamNFT(NFT_CONTRACT_ADDRESS, tokenId, priceInWei);
    const receipt = await listTx.wait();

    return {
      itemId: receipt.events[0].args.itemId.toString(),
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('Failed to list NFT for sale:', error);
    throw error;
  }
};

// Buy NFT from marketplace
export const buyNFT = async (signer, itemId, price) => {
  try {
    const marketplaceContract = getMarketplaceContract(signer);

    // Execute purchase transaction with exact value
    const tx = await marketplaceContract.buyDreamNFT(itemId, {
      value: price
    });

    const receipt = await tx.wait();

    return {
      transactionHash: receipt.transactionHash,
      successful: true
    };
  } catch (error) {
    console.error('Failed to buy NFT:', error);
    throw error;
  }
};

// Get NFT metadata from tokenURI
export const getNFTMetadata = async (tokenURI) => {
  try {
    // Convert IPFS URI to HTTP gateway URL if needed
    const url = tokenURI.startsWith('ipfs://')
      ? getIPFSGatewayUrl(tokenURI)
      : tokenURI;

    const response = await fetch(url);
    const metadata = await response.json();

    return metadata;
  } catch (error) {
    console.error('Failed to fetch NFT metadata:', error);
    throw error;
  }
};

// Get all NFTs owned by an address
export const getNFTsByOwner = async (provider, ownerAddress) => {
  try {
    const nftContract = getNFTContract(provider);

    // Get balance (number of NFTs owned)
    const balance = await nftContract.balanceOf(ownerAddress);

    const nfts = [];

    // Fetch each NFT by index
    for (let i = 0; i < balance; i++) {
      const tokenId = await nftContract.tokenOfOwnerByIndex(ownerAddress, i);
      const tokenURI = await nftContract.tokenURI(tokenId);

      try {
        const metadata = await getNFTMetadata(tokenURI);

        nfts.push({
          tokenId: tokenId.toString(),
          tokenURI,
          metadata
        });
      } catch (metadataError) {
        console.error(`Error fetching metadata for token ${tokenId}:`, metadataError);
        // Still add the NFT with basic info
        nfts.push({
          tokenId: tokenId.toString(),
          tokenURI,
          metadata: { name: `Dream #${tokenId}`, description: 'Metadata unavailable' }
        });
      }
    }

    return nfts;
  } catch (error) {
    console.error('Failed to fetch NFTs by owner:', error);
    throw error;
  }
};

// Get marketplace listings
export const getMarketplaceListings = async (provider, activeOnly = true) => {
  try {
    const marketplaceContract = getMarketplaceContract(provider);

    // Get total number of items
    const itemCount = await marketplaceContract.itemCount();

    const listings = [];

    // Fetch each marketplace item
    for (let i = 1; i <= itemCount; i++) {
      const item = await marketplaceContract.idToMarketItem(i);

      // Skip sold items if activeOnly is true
      if (activeOnly && item.sold) continue;

      // Get NFT metadata
      const nftContract = getNFTContract(provider);
      const tokenURI = await nftContract.tokenURI(item.tokenId);
      let metadata = {};

      try {
        metadata = await getNFTMetadata(tokenURI);
      } catch (metadataError) {
        console.error(`Error fetching metadata for marketplace item ${i}:`, metadataError);
      }

      listings.push({
        itemId: item.itemId.toString(),
        nftContract: item.nftContract,
        tokenId: item.tokenId.toString(),
        seller: item.seller,
        owner: item.owner,
        price: ethers.utils.formatEther(item.price),
        sold: item.sold,
        tokenURI,
        metadata
      });
    }

    return listings;
  } catch (error) {
    console.error('Failed to fetch marketplace listings:', error);
    throw error;
  }
};
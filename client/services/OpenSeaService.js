// services/OpenSeaService.js
import axios from 'axios';
import ApiEndpoints from '../constants/ApiEndpoints';
import { ethers } from 'ethers';

class OpenSeaService {
  constructor() {
    this.apiKey = 'YOUR_OPENSEA_API_KEY'; // Replace with actual API key
    this.baseUrl = 'https://api.opensea.io/api/v1';
    this.testnetUrl = 'https://testnets-api.opensea.io/api/v1';

    // Use testnet for development
    this.useTestnet = true;

    this.http = axios.create({
      baseURL: this.useTestnet ? this.testnetUrl : this.baseUrl,
      headers: {
        'X-API-KEY': this.apiKey
      }
    });
  }

  // Get assets owned by a wallet address
  async getAssetsByOwner(ownerAddress) {
    try {
      const response = await this.http.get('/assets', {
        params: {
          owner: ownerAddress,
          limit: 50
        }
      });

      return response.data.assets;
    } catch (error) {
      console.error('Failed to fetch OpenSea assets:', error);
      throw error;
    }
  }

  // Get a single asset by contract address and token ID
  async getAsset(contractAddress, tokenId) {
    try {
      const response = await this.http.get(`/asset/${contractAddress}/${tokenId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch OpenSea asset:', error);
      throw error;
    }
  }

  // Get collection data
  async getCollection(collectionSlug) {
    try {
      const response = await this.http.get(`/collection/${collectionSlug}`);
      return response.data.collection;
    } catch (error) {
      console.error('Failed to fetch OpenSea collection:', error);
      throw error;
    }
  }

  // Get events (sales, transfers, etc.)
  async getEvents(params) {
    try {
      const response = await this.http.get('/events', {
        params: {
          ...params,
          limit: 50
        }
      });

      return response.data.asset_events;
    } catch (error) {
      console.error('Failed to fetch OpenSea events:', error);
      throw error;
    }
  }

  // Generate link to OpenSea marketplace for an NFT
  getOpenSeaLink(contractAddress, tokenId) {
    if (this.useTestnet) {
      return `https://testnets.opensea.io/assets/sepolia/${contractAddress}/${tokenId}`;
    } else {
      return `https://opensea.io/assets/ethereum/${contractAddress}/${tokenId}`;
    }
  }

  // Generate link to OpenSea marketplace for a collection
  getCollectionLink(collectionSlug) {
    if (this.useTestnet) {
      return `https://testnets.opensea.io/collection/${collectionSlug}`;
    } else {
      return `https://opensea.io/collection/${collectionSlug}`;
    }
  }
}

export default new OpenSeaService();
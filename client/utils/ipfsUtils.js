// src/utils/ipfsUtils.js
import axios from 'axios';
import Constants from 'expo-constants';

// IPFS gateway for retrieving content
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

// Pinata API for uploading content
const PINATA_API_KEY = Constants.expoConfig.extra.pinataApiKey;
const PINATA_SECRET_KEY = Constants.expoConfig.extra.pinataSecretKey;

/**
 * Upload a file to IPFS using Pinata
 * @param {File|Blob} file - The file to upload
 * @param {string} name - Name for the file
 * @returns {Promise<{success: boolean, hash: string, url: string}>}
 */
export const uploadFileToIPFS = async (file, name) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: name || 'File ' + new Date().toISOString(),
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY
        }
      }
    );

    const hash = response.data.IpfsHash;

    return {
      success: true,
      hash,
      url: `${IPFS_GATEWAY}${hash}`
    };
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload JSON data to IPFS using Pinata
 * @param {Object} jsonData - The JSON data to upload
 * @returns {Promise<{success: boolean, hash: string, url: string}>}
 */
export const uploadJSONToIPFS = async (jsonData) => {
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      jsonData,
      {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY
        }
      }
    );

    const hash = response.data.IpfsHash;

    return {
      success: true,
      hash,
      url: `${IPFS_GATEWAY}${hash}`
    };
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Retrieve content from IPFS
 * @param {string} hash - The IPFS hash/CID
 * @returns {Promise<{success: boolean, data: any}>}
 */
export const getFromIPFS = async (hash) => {
  try {
    const response = await axios.get(`${IPFS_GATEWAY}${hash}`);

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Convert IPFS URI to HTTP URL
 * @param {string} uri - The IPFS URI (ipfs://...)
 * @returns {string} HTTP URL
 */
export const ipfsUriToUrl = (uri) => {
  if (!uri) return '';

  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', IPFS_GATEWAY);
  }

  return uri;
};
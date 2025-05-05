// constants/ApiEndpoints.js
const BASE_URL = 'https://api.dreamnft.app';
const PINATA_URL = 'https://api.pinata.cloud';
const SEPOLIA_RPC = 'https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY';

export default {
  // Authentication
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    RESET_PASSWORD: `${BASE_URL}/auth/reset-password`
  },
  // Dreams
  DREAMS: {
    GET_ALL: `${BASE_URL}/dreams`,
    GET_BY_ID: (id) => `${BASE_URL}/dreams/${id}`,
    CREATE: `${BASE_URL}/dreams`,
    UPDATE: (id) => `${BASE_URL}/dreams/${id}`,
    DELETE: (id) => `${BASE_URL}/dreams/${id}`,
    LIKE: (id) => `${BASE_URL}/dreams/${id}/like`,
    VALIDATE: `${BASE_URL}/dreams/validate`
  },
  // NFTs
  NFTS: {
    GET_ALL: `${BASE_URL}/nfts`,
    GET_BY_ID: (id) => `${BASE_URL}/nfts/${id}`,
    CREATE: `${BASE_URL}/nfts`,
    TRANSFER: `${BASE_URL}/nfts/transfer`
  },
  // Marketplace
  MARKETPLACE: {
    LISTINGS: `${BASE_URL}/marketplace/listings`,
    LIST_ITEM: `${BASE_URL}/marketplace/list`,
    PURCHASE: `${BASE_URL}/marketplace/purchase`,
    CANCEL_LISTING: (id) => `${BASE_URL}/marketplace/${id}/cancel`
  },
  // IPFS
  IPFS: {
    UPLOAD: `${PINATA_URL}/pinning/pinFileToIPFS`,
    PIN_JSON: `${PINATA_URL}/pinning/pinJSONToIPFS`
  },
  // AI Services
  AI: {
    IMAGE_GENERATION: `${BASE_URL}/ai/generate-image`, // Düzeltildi
    ANALYZE_DREAM: `${BASE_URL}/ai/analyze-dream`,
    VALIDATE_DREAM: `${BASE_URL}/ai/validate-dream`
  },
  // Blockchain
  BLOCKCHAIN: {
    RPC_URL: SEPOLIA_RPC
  }
};
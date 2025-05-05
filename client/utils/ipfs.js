// src/utils/ipfs.js
// This would use a real IPFS storage service in production

// For simplicity, we'll use nft.storage's API as an example
const NFT_STORAGE_API_KEY = 'YOUR_NFT_STORAGE_KEY'; // Replace with your key

// IPFS gateway URLs
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.ipfs.io/ipfs/'
];

// Convert IPFS URI to HTTP gateway URL
export const getIPFSGatewayUrl = (ipfsUri) => {
  if (!ipfsUri) return null;

  // If already an HTTP URL, return as is
  if (ipfsUri.startsWith('http')) {
    return ipfsUri;
  }

  // Extract CID from ipfs:// URI
  const cid = ipfsUri.replace('ipfs://', '').replace(/^\/\//, '');

  // Use first gateway (in production, you might want to try multiple gateways)
  return `${IPFS_GATEWAYS[0]}${cid}`;
};

// Upload JSON metadata to IPFS
export const uploadMetadataToIPFS = async (metadata) => {
  try {
    const response = await fetch('https://api.nft.storage/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NFT_STORAGE_API_KEY}`
      },
      body: JSON.stringify(metadata)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to upload to IPFS');
    }

    // Return IPFS URI
    return `ipfs://${data.value.cid}`;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
};

// Upload file to IPFS (image, audio)
export const uploadFileToIPFS = async (file) => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://api.nft.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NFT_STORAGE_API_KEY}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to upload file to IPFS');
    }

    // Return IPFS URI
    return `ipfs://${data.value.cid}`;
  } catch (error) {
    console.error('IPFS file upload error:', error);
    throw error;
  }
};

// Create and upload NFT metadata
export const createNFTMetadata = async (dream, creator) => {
  try {
    // Upload image to IPFS if exists
    let imageUri = null;
    if (dream.imageUrl) {
      // In a real app, you would download the image and upload to IPFS
      // Here we'll assume dream.imageUrl is already an IPFS URI or HTTP URL
      imageUri = dream.imageUrl;
    }

    // Upload audio to IPFS if exists
    let audioUri = null;
    if (dream.audioUrl) {
      // In a real app, you would download the audio and upload to IPFS
      // Here we'll assume dream.audioUrl is already an IPFS URI or HTTP URL
      audioUri = dream.audioUrl;
    }

    // Create metadata object
    const metadata = {
      name: dream.title || `Dream #${dream.id}`,
      description: dream.description,
      image: imageUri,
      animation_url: audioUri, // For audio NFTs
      external_url: `https://dreamnft.com/dreams/${dream.id}`,
      attributes: [
        {
          trait_type: 'Rarity Score',
          value: dream.rarity
        },
        {
          trait_type: 'AI Validation Score',
          value: dream.aiValidationScore
        },
        {
          trait_type: 'Has Audio',
          value: !!dream.audioUrl
        },
        {
          trait_type: 'Has Image',
          value: !!dream.imageUrl
        },
        {
          trait_type: 'Creator',
          value: creator
        }
      ]
    };

    // Add tags as attributes
    if (dream.allTags && dream.allTags.length > 0) {
      dream.allTags.forEach(tag => {
        metadata.attributes.push({
          trait_type: 'Tag',
          value: tag
        });
      });
    }

    // Upload metadata to IPFS
    const metadataUri = await uploadMetadataToIPFS(metadata);

    return {
      tokenURI: metadataUri,
      metadata
    };
  } catch (error) {
    console.error('Error creating NFT metadata:', error);
    throw error;
  }
};
// src/models/Dream.js
/**
 * Dream Model
 * Represents a user's dream record with optional NFT data
 */
export class Dream {
  constructor(data = {}) {
    this.id = data.id || null;
    this.userId = data.userId || null;
    this.title = data.title || '';
    this.description = data.description || '';
    this.audioUrl = data.audioUrl || null;
    this.imageUrl = data.imageUrl || null;
    this.isNFT = data.isNFT || false;
    this.nftTokenId = data.nftTokenId || null;
    this.nftContractAddress = data.nftContractAddress || null;
    this.nftMetadataUrl = data.nftMetadataUrl || null;
    this.rarity = data.rarity || 0;
    this.aiValidated = data.aiValidated || false;
    this.aiValidationScore = data.aiValidationScore || 0;
    this.aiGeneratedTags = data.aiGeneratedTags || [];
    this.userTags = data.userTags || [];
    this.likes = data.likes || 0;
    this.views = data.views || 0;
    this.commentCount = data.commentCount || 0;
    this.isPublic = data.isPublic || false;
    this.isNSFW = data.isNSFW || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.deletedAt = data.deletedAt || null;
  }

  get allTags() {
    return [...new Set([...this.aiGeneratedTags, ...this.userTags])];
  }

  get isDeleted() {
    return !!this.deletedAt;
  }

  get hasAudio() {
    return !!this.audioUrl;
  }

  get hasImage() {
    return !!this.imageUrl;
  }

  // Format for display in lists
  toListItem() {
    return {
      id: this.id,
      title: this.title,
      description: this.truncatedDescription,
      isNFT: this.isNFT,
      rarity: this.rarity,
      imageUrl: this.imageUrl,
      hasAudio: this.hasAudio,
      createdAt: this.createdAt,
      tags: this.allTags.slice(0, 3),
      likes: this.likes,
      commentCount: this.commentCount
    };
  }

  // Helper to get a truncated description
  get truncatedDescription() {
    return this.description.length > 120
      ? `${this.description.substring(0, 120)}...`
      : this.description;
  }

  // Create Firebase-ready object
  toFirestore() {
    const data = { ...this };
    delete data.id;
    return data;
  }

  // Calculate rarity score based on various factors
  calculateRarity() {
    let score = 0;

    // Base score from AI validation
    score += this.aiValidationScore * 10;

    // Audio content bonus
    if (this.hasAudio) score += 20;

    // Image content bonus
    if (this.hasImage) score += 15;

    // Description length factor
    const descLength = this.description.length;
    if (descLength > 500) score += 25;
    else if (descLength > 300) score += 15;
    else if (descLength > 100) score += 5;

    // Tag diversity bonus
    score += Math.min(this.allTags.length * 2, 20);

    // Engagement bonus
    score += Math.min(this.likes / 10, 20);
    score += Math.min(this.commentCount / 5, 10);

    // Normalize to 0-100 range
    this.rarity = Math.min(Math.max(Math.round(score), 0), 100);
    return this.rarity;
  }
}
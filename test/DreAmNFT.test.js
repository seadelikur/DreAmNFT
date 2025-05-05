// test/DreAmNFT.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DreAmNFT", function () {
  let dreamNFT;
  let owner;
  let addr1;
  let addr2;
  
  beforeEach(async function () {
    // Get contract factories
    const DreAmNFT = await ethers.getContractFactory("DreAmNFT");
    
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy contracts
    dreamNFT = await DreAmNFT.deploy();
    await dreamNFT.deployed();
  });
  
  describe("Minting", function () {
    it("Should mint a new dream NFT", async function () {
      const dreamId = "dream123";
      const title = "Flying Dream";
      const uri = "ipfs://QmXyz123";
      const rarity = 2; // Rare
      
      // Mint the NFT
      await expect(dreamNFT.connect(addr1).mintDream(dreamId, title, uri, rarity))
        .to.emit(dreamNFT, "DreamMinted")
        .withArgs(1, addr1.address, dreamId, rarity);
      
      // Verify ownership
      expect(await dreamNFT.ownerOf(1)).to.equal(addr1.address);
      
      // Check token URI
      expect(await dreamNFT.tokenURI(1)).to.equal(uri);
      
      // Check dream details
      const dream = await dreamNFT.getDreamDetails(1);
      expect(dream.dreamId).to.equal(dreamId);
      expect(dream.title).to.equal(title);
      expect(dream.uri).to.equal(uri);
      expect(dream.rarity).to.equal(rarity);
      expect(dream.author).to.equal(addr1.address);
    });
    
    it("Should fail when minting with invalid rarity", async function () {
      const dreamId = "dream123";
      const title = "Flying Dream";
      const uri = "ipfs://QmXyz123";
      const invalidRarity = 5; // Legendary is 4, so 5 is invalid
      
      await expect(
        dreamNFT.mintDream(dreamId, title, uri, invalidRarity)
      ).to.be.revertedWith("Invalid rarity level");
    });
  });
  
  describe("Royalties", function () {
    it("Should calculate correct royalty amount", async function () {
      // Default royalty is 2.5% (250 basis points)
      const salePrice = ethers.utils.parseEther("1.0");
      const expectedRoyalty = salePrice.mul(250).div(10000);
      
      expect(await dreamNFT.calculateRoyalty(salePrice)).to.equal(expectedRoyalty);
    });
    
    it("Should allow owner to change royalty percentage", async function () {
      const newRoyaltyBasisPoints = 300; // 3%
      
      await dreamNFT.setRoyaltyPercentage(newRoyaltyBasisPoints);
      expect(await dreamNFT.getRoyaltyPercentage()).to.equal(newRoyaltyBasisPoints);
      
      // Check new royalty calculation
      const salePrice = ethers.utils.parseEther("1.0");
      const expectedRoyalty = salePrice.mul(newRoyaltyBasisPoints).div(10000);
      expect(await dreamNFT.calculateRoyalty(salePrice)).to.equal(expectedRoyalty);
    });
    
    it("Should prevent setting royalty too high", async function () {
      const tooHighRoyalty = 1500; // 15%
      
      await expect(
        dreamNFT.setRoyaltyPercentage(tooHighRoyalty)
      ).to.be.revertedWith("Royalty too high");
    });
    
    it("Should handle royalty payments correctly", async function () {
      // Mint NFT
      const dreamId = "dream123";
      const title = "Flying Dream";
      const uri = "ipfs://QmXyz123";
      const rarity = 2; // Rare
      
      await dreamNFT.connect(addr1).mintDream(dreamId, title, uri, rarity);
      
      // Calculate royalty for a sale price
      const salePrice = ethers.utils.parseEther("1.0");
      const royaltyAmount = await dreamNFT.calculateRoyalty(salePrice);
      
      // Check balance before payment
      const initialBalance = await addr1.getBalance();
      
      // Pay royalty
      await expect(
        dreamNFT.connect(addr2).payRoyalty(1, salePrice, { value: royaltyAmount })
      ).to.emit(dreamNFT, "RoyaltyPaid")
        .withArgs(addr1.address, addr2.address, royaltyAmount);
      
      // Check balance after payment
      const finalBalance = await addr1.getBalance();
      expect(finalBalance.sub(initialBalance)).to.equal(royaltyAmount);
    });
  });
});

// test/DreAmMarketplace.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DreAmMarketplace", function () {
  let dreamNFT;
  let marketplace;
  let owner;
  let seller;
  let buyer;
  let tokenId;
  
  beforeEach(async function () {
    // Get contract factories
    const DreAmNFT = await ethers.getContractFactory("DreAmNFT");
    const DreAmMarketplace = await ethers.getContractFactory("DreAmMarketplace");
    
    // Get signers
    [owner, seller, buyer] = await ethers.getSigners();
    
    // Deploy contracts
    dreamNFT = await DreAmNFT.deploy();
    await dreamNFT.deployed();
    
    marketplace = await DreAmMarketplace.deploy();
    await marketplace.deployed();
    
    // Mint NFT to seller
    const tx = await dreamNFT.connect(seller).mintDream(
      "dream123",
      "Flying Dream",
      "ipfs://QmXyz123",
      2 // Rare
    );
    
    const receipt = await tx.wait();
    const event = receipt.events.find(e => e.event === "DreamMinted");
    tokenId = event.args.tokenId;
  });
  
  describe("Listing", function () {
    it("Should list an NFT for sale", async function () {
      const price = ethers.utils.parseEther("1.0");
      
      // Approve marketplace to transfer NFT
      await dreamNFT.connect(seller).approve(marketplace.address, tokenId);
      
      // List NFT
      await expect(
        marketplace.connect(seller).listItem(dreamNFT.address, tokenId, price)
      ).to.emit(marketplace, "ItemListed")
        .withArgs(1, seller.address, dreamNFT.address, tokenId, price);
      
      // Check listing details
      const listing = await marketplace.getListing(1);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.tokenAddress).to.equal(dreamNFT.address);
      expect(listing.tokenId).to.equal(tokenId);
      expect(listing.price).to.equal(price);
      expect(listing.isActive).to.be.true;
    });
    
    it("Should fail if seller is not the owner", async function () {
      const price = ethers.utils.parseEther("1.0");
      
      await expect(
        marketplace.connect(buyer).listItem(dreamNFT.address, tokenId, price)
      ).to.be.revertedWith("Not the owner");
    });
    
    it("Should fail if marketplace is not approved", async function () {
      const price = ethers.utils.parseEther("1.0");
      
      await expect(
        marketplace.connect(seller).listItem(dreamNFT.address, tokenId, price)
      ).to.be.revertedWith("Marketplace not approved");
    });
  });
  
  describe("Buying", function () {
    let listingId;
    let price;
    
    beforeEach(async function () {
      price = ethers.utils.parseEther("1.0");
      
      // Approve marketplace
      await dreamNFT.connect(seller).approve(marketplace.address, tokenId);
      
      // List NFT
      const tx = await marketplace.connect(seller).listItem(dreamNFT.address, tokenId, price);
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "ItemListed");
      listingId = event.args.listingId;
    });
    
    it("Should allow buying a listed NFT", async function () {
      // Get initial balances
      const initialSellerBalance = await seller.getBalance();
      
      // Calculate marketplace fee
      const marketplaceFee = price.mul(await marketplace.getMarketplaceFee()).div(10000);
      const sellerAmount = price.sub(marketplaceFee);
      
      // Buy NFT
      await expect(
        marketplace.connect(buyer).buyItem(listingId, { value: price })
      ).to.emit(marketplace, "ItemSold")
        .withArgs(listingId, seller.address, buyer.address, price);
      
      // Check NFT ownership
      expect(await dreamNFT.ownerOf(tokenId)).to.equal(buyer.address);
      
      // Check listing status
      const listing = await marketplace.getListing(listingId);
      expect(listing.isActive).to.be.false;
      
      // Check seller balance (approximately due to gas costs)
      const finalSellerBalance = await seller.getBalance();
      const balanceChange = finalSellerBalance.sub(initialSellerBalance);
      
      // Allow for some tolerance due to gas costs
      expect(balanceChange).to.be.closeTo(sellerAmount, ethers.utils.parseEther("0.01"));
    });
    
    it("Should fail if payment is insufficient", async function () {
      const insufficientAmount = price.sub(ethers.utils.parseEther("0.1"));
      
      await expect(
        marketplace.connect(buyer).buyItem(listingId, { value: insufficientAmount })
      ).to.be.revertedWith("Insufficient payment");
    });
    
    it("Should fail if listing is not active", async function () {
      // Cancel listing
      await marketplace.connect(seller).cancelListing(listingId);
      
      await expect(
        marketplace.connect(buyer).buyItem(listingId, { value: price })
      ).to.be.revertedWith("Listing not active");
    });
  });
  
  describe("Cancelling", function () {
    let listingId;
    
    beforeEach(async function () {
      const price = ethers.utils.parseEther("1.0");
      
      // Approve marketplace
      await dreamNFT.connect(seller).approve(marketplace.address, tokenId);
      
      // List NFT
      const tx = await marketplace.connect(seller).listItem(dreamNFT.address, tokenId, price);
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "ItemListed");
      listingId = event.args.listingId;
    });
    
    it("Should allow seller to cancel listing", async function () {
      await expect(
        marketplace.connect(seller).cancelListing(listingId)
      ).to.emit(marketplace, "ListingCancelled")
        .withArgs(listingId);
      
      // Check listing status
      const listing = await marketplace.getListing(listingId);
      expect(listing.isActive).to.be.false;
    });
    
    it("Should allow owner to cancel any listing", async function () {
      await expect(
        marketplace.connect(owner).cancelListing(listingId)
      ).to.emit(marketplace, "ListingCancelled")
        .withArgs(listingId);
      
      // Check listing status
      const listing = await marketplace.getListing(listingId);
      expect(listing.isActive).to.be.false;
    });
    
    it("Should fail if not seller or owner", async function () {
      await expect(
        marketplace.connect(buyer).cancelListing(listingId)
      ).to.be.revertedWith("Not authorized");
    });
  });
  
  describe("Marketplace fees", function () {
    it("Should allow owner to change marketplace fee", async function () {
      const newFee = 300; // 3%
      
      await expect(
        marketplace.connect(owner).setMarketplaceFee(newFee)
      ).to.emit(marketplace, "MarketplaceFeeChanged")
        .withArgs(newFee);
      
      expect(await marketplace.getMarketplaceFee()).to.equal(newFee);
    });
    
    it("Should prevent non-owner from changing fee", async function () {
      await expect(
        marketplace.connect(seller).setMarketplaceFee(300)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    
    it("Should prevent setting fee too high", async function () {
      const tooHighFee = 1500; // 15%
      
      await expect(
        marketplace.connect(owner).setMarketplaceFee(tooHighFee)
      ).to.be.revertedWith("Fee too high");
    });
  });
});
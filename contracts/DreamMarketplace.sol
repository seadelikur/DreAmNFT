// contracts/DreAmMarketplace.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IDreAmNFT {
    function getRoyaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount);
}

/**
 * @title DreAmMarketplace
 * @dev Contract for buying and selling dream NFTs
 */
contract DreAmMarketplace is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    // Listing ID counter
    Counters.Counter private _listingIdCounter;
    
    // Marketplace fee (in basis points, 250 = 2.5%)
    uint16 public marketplaceFee = 250;
    
    // Structure for NFT listings
    struct Listing {
        uint256 listingId;
        address nftContract;
        uint256 tokenId;
        address seller;
        address buyer;
        uint256 price;
        bool active;
        uint256 listedAt;
        uint256 soldAt;
    }
    
    // Mapping of listing ID to Listing struct
    mapping(uint256 => Listing) public listings;
    
    // Events
    event ListingCreated(uint256 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address seller, uint256 price);
    event ListingCancelled(uint256 indexed listingId);
    event ListingSold(uint256 indexed listingId, address indexed buyer, uint256 price);
    event MarketplaceFeeUpdated(uint16 newMarketplaceFee);

    constructor() {
        // Start listing IDs at 1
        _listingIdCounter.increment();
    }
    
    /**
     * @dev Creates a new listing for an NFT
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID of the NFT
     * @param price Listing price in wei
     */
    function createListing(address nftContract, uint256 tokenId, uint256 price) 
        external 
        nonReentrant 
        returns (uint256) 
    {
        require(price > 0, "Price must be greater than 0");
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "You don't own this NFT");
        require(IERC721(nftContract).isApprovedForAll(msg.sender, address(this)), "Marketplace not approved to transfer NFT");
        
        uint256 listingId = _listingIdCounter.current();
        _listingIdCounter.increment();
        
        listings[listingId] = Listing({
            listingId: listingId,
            nftContract: nftContract,
            tokenId: tokenId,
            seller: msg.sender,
            buyer: address(0),
            price: price,
            active: true,
            listedAt: block.timestamp,
            soldAt: 0
        });
        
        emit ListingCreated(listingId, nftContract, tokenId, msg.sender, price);
        
        return listingId;
    }
    
    /**
     * @dev Cancels an active listing
     * @param listingId ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.active, "Listing is not active");
        require(listing.seller == msg.sender, "Only seller can cancel listing");
        
        listing.active = false;
        
        emit ListingCancelled(listingId);
    }
    
    /**
     * @dev Purchases an NFT from a listing
     * @param listingId ID of the listing to purchase
     */
    function buyNFT(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.active, "Listing is not active");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Seller cannot buy their own NFT");
        
        listing.active = false;
        listing.buyer = msg.sender;
        listing.soldAt = block.timestamp;
        
        // Calculate marketplace fee
        uint256 marketplaceAmount = (listing.price * marketplaceFee) / 10000;
        
        // Calculate royalty fee
        address royaltyReceiver;
        uint256 royaltyAmount;
        
        try IDreAmNFT(listing.nftContract).getRoyaltyInfo(listing.tokenId, listing.price) returns (address receiver, uint256 amount) {
            royaltyReceiver = receiver;
            royaltyAmount = amount;
        } catch {
            // Contract doesn't support royalty interface or call failed
            royaltyReceiver = address(0);
            royaltyAmount = 0;
        }
        
        // Calculate amount to send to seller
        uint256 sellerAmount = listing.price - marketplaceAmount - royaltyAmount;
        
        // Transfer NFT to buyer
        IERC721(listing.nftContract).transferFrom(listing.seller, msg.sender, listing.tokenId);
        
        // Send royalty fee to creator if applicable
        if (royaltyReceiver != address(0) && royaltyAmount > 0) {
            (bool royaltySuccess, ) = payable(royaltyReceiver).call{value: royaltyAmount}("");
            require(royaltySuccess, "Failed to send royalty");
        }
        
        // Send payment to seller
        (bool sellerSuccess, ) = payable(listing.seller).call{value: sellerAmount}("");
        require(sellerSuccess, "Failed to send payment to seller");
        
        emit ListingSold(listingId, msg.sender, listing.price);
        
        // Refund excess payment if any
        if (msg.value > listing.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            require(refundSuccess, "Failed to refund excess payment");
        }
    }
    
    /**
     * @dev Gets the details of a listing
     * @param listingId ID of the listing
     */
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }
    
    /**
     * @dev Gets all active listings
     * @return array of active listings
     */
    function getActiveListings() external view returns (Listing[] memory) {
        uint256 totalListings = _listingIdCounter.current() - 1;
        uint256 activeCount = 0;
        
        // Count active listings
        for (uint256 i = 1; i <= totalListings; i++) {
            if (listings[i].active) {
                activeCount++;
            }
        }
        
        // Create array of active listings
        Listing[] memory activeListings = new Listing[](activeCount);
        
        uint256 index = 0;
        for (uint256 i = 1; i <= totalListings; i++) {
            if (listings[i].active) {
                activeListings[index] = listings[i];
                index++;
            }
        }
        
        return activeListings;
    }
    
    /**
     * @dev Gets all listings by a seller
     * @param seller Address of the seller
     */
    function getListingsBySeller(address seller) external view returns (Listing[] memory) {
        uint256 totalListings = _listingIdCounter.current() - 1;
        uint256 sellerCount = 0;
        
        // Count seller listings
        for (uint256 i = 1; i <= totalListings; i++) {
            if (listings[i].seller == seller) {
                sellerCount++;
            }
        }
        
        // Create array of seller listings
        Listing[] memory sellerListings = new Listing[](sellerCount);
        
        uint256 index = 0;
        for (uint256 i = 1; i <= totalListings; i++) {
            if (listings[i].seller == seller) {
                sellerListings[index] = listings[i];
                index++;
            }
        }
        
        return sellerListings;
    }
    
    /**
     * @dev Updates the marketplace fee (only owner)
     * @param newMarketplaceFee New marketplace fee in basis points (100 = 1%)
     */
    function updateMarketplaceFee(uint16 newMarketplaceFee) external onlyOwner {
        require(newMarketplaceFee <= 1000, "Fee cannot exceed 10%");
        marketplaceFee = newMarketplaceFee;
        emit MarketplaceFeeUpdated(newMarketplaceFee);
    }
    
    /**
     * @dev Withdraws marketplace fees to owner (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
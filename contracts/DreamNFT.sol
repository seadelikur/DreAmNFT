// contracts/DreAmNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DreAmNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    mapping(uint256 => uint8) public dreamRarity;
    mapping(uint256 => address) public dreamCreator;
    uint16 public royaltyBasisPoints = 250;
    uint256 public maxMintPrice = 0.1 ether;
    string private _baseURIExtended;

    event DreamMinted(uint256 indexed tokenId, address indexed creator, uint8 rarity, string tokenURI);
    event RoyaltyPaid(uint256 indexed tokenId, address indexed creator, uint256 amount);
    event RoyaltyUpdated(uint16 newRoyaltyBasisPoints);

    constructor() ERC721("DreAmNFT", "DREAM") {
        _tokenIdCounter.increment();
    }

    // 1. Docstring ve parametre ismi düzeltmesi
    /**
     * @dev Mints a new dream NFT
     * @param to The address that will own the minted token
     * @param tokenURI_ URI for the token metadata
     * @param rarity Rarity level of the dream (0-4)
     */
    function mintDream(address to, string memory tokenURI_, uint8 rarity)
        external
        payable
        nonReentrant
        returns (uint256)
    {
        require(rarity <= 4, "Invalid rarity level");

        if (msg.sender != owner() && rarity == 4) {
            require(msg.value >= 0.05 ether, "Insufficient payment for legendary dream");
        }

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_); // 2. tokenURI -> tokenURI_

        dreamRarity[tokenId] = rarity;
        dreamCreator[tokenId] = msg.sender;

        emit DreamMinted(tokenId, msg.sender, rarity, tokenURI_); // 3. tokenURI -> tokenURI_

        return tokenId;
    }

    // 4. Override listesi düzeltmesi
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable) // ERC721URIStorage kaldırıldı
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    // 5. ERC721URIStorage desteği eklendi
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage) // ERC721URIStorage eklendi
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Diğer fonksiyonlar aynı kalıyor...
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseURIExtended;
    }

    // Kalan fonksiyonlar değişmedi...
    function getRoyaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address, uint256) {
        require(_exists(tokenId), "Query for nonexistent token");
        address creator = dreamCreator[tokenId];
        uint256 royalty = (salePrice * royaltyBasisPoints) / 10000;
        return (creator, royalty);
    }

    function updateRoyalty(uint16 newRoyaltyBasisPoints) external onlyOwner {
        require(newRoyaltyBasisPoints <= 1000, "Royalty cannot exceed 10%");
        royaltyBasisPoints = newRoyaltyBasisPoints;
        emit RoyaltyUpdated(newRoyaltyBasisPoints);
    }

    function updateMaxMintPrice(uint256 newMaxPrice) external onlyOwner {
        maxMintPrice = newMaxPrice;
    }

    function setBaseURI(string memory baseURI_) external onlyOwner {
        _baseURIExtended = baseURI_;
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
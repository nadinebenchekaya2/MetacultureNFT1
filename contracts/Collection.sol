// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./NFTErrors.sol";

//import "hardhat/console.sol";

contract Collection is ERC721URIStorage, ReentrancyGuard {
    using Counters for Counters.Counter;
    // Counter for tracking the number of NFTs in the collection
    Counters.Counter internal nftsIds;
    // Counter for tracking the number of NFTs beeing sold
    Counters.Counter internal nftsInSale;
    // the smart contract owner address
    address internal marketplaceScAdr;
    // the owner of smart contract owner
    address payable internal owner;
    // Address of the collection creator
    address payable internal collectionCreator;
    // uriExists to track all uri already used, this to ensure that all nfts have unique uris
    mapping(string => bool) internal uriExists;
    // idMarketItem is mapping between Ids <=> Market Items (strcture)
    mapping(uint256 => NftStructInfo) internal idToNftInfo;

    // Market Item Structure
    struct NftStructInfo {
        uint256 price;
        address payable seller;
        bool isInSale;
    }

    /// @dev Modifier to ensure that only the marketplace owner can call the function.
    function _onlyOwner() private view {
        require(msg.sender == marketplaceScAdr, NFTErrors.ONLY_MP_OWNER);
    }

    /// @dev Modifier to check that an NFT with the given ID exists.
    /// @param _nftId ID of the NFT to check for existence.
    /// @notice Reverts if an NFT with the given ID does not exist.
    function _nftExists(uint256 _nftId) private view {
        require(_exists(_nftId), NFTErrors.NFT_NOT_EXIST);
    }

    /// @dev Updates the information for an existing NFT in the marketplace.
    /// @param _nftId ID of the NFT to update.
    /// @param _sellerAdr Address of the seller.
    /// @param _price Requested sale price for the NFT.
    /// @param _status Boolean flag indicating whether the NFT is in sale.
    function _nftUpdateInfo(uint256 _nftId, address _sellerAdr, uint256 _price, bool _status) private {
        // Sets the address of the seller.
        idToNftInfo[_nftId].seller = payable(_sellerAdr);
        // Sets the requested sale price.
        idToNftInfo[_nftId].price = _price;
        // Flags the NFT as in sale.
        idToNftInfo[_nftId].isInSale = _status;
    }

    /// @dev Modifier to check that the function can only be called by the marketplace owner.
    /// @notice Reverts if the caller is not the marketplace owner.
    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    /// @dev Modifier to check that an NFT with the given ID exists in the collection.
    /// @param _nftId ID of the NFT to check for existence.
    /// @notice Reverts if an NFT with the given ID does not exist in the collection.
    modifier nftExists(uint256 _nftId) {
        // Ensure that the NFT ID exists in this collection.
        _nftExists(_nftId);
        _;
    }

    /// @dev Constructor for creating a new NFT collection.
    /// @param _marketplaceScAdr Address of the marketplace owner.
    /// @param _owner The Wallet Address of the marketplace owner.
    /// @param _collectionCreator Address of the collection creator.
    /// @param _collectionName Name of the NFT collection.
    /// @param _symbol Symbol of the NFT collection.
    constructor(
        address _marketplaceScAdr,
        address payable _owner,
        address payable _collectionCreator,
        string memory _collectionName,
        string memory _symbol
    ) ERC721(_collectionName, _symbol) {
        // Set the marketplace owner, collection creator, and curator addresses.
        marketplaceScAdr = _marketplaceScAdr;
        owner = _owner;
        collectionCreator = _collectionCreator;
    }

    /// @dev Mint a new NFT and assign it to the specified address.
    /// If `_putInSale` is true, the NFT is also listed for sale in the marketplace.
    /// @param _tokenUri The tokenURI for the NFT.
    /// @param _putInSale If true, the NFT is listed for sale.
    /// @param _price The sale price for the NFT.
    /// @param _sender The address of the sender calling the function.
    /// @return uint256 ID of the newly minted NFT.
    function mintNft(
        bool _putInSale,
        uint256 _price,
        string memory _tokenUri,
        address _sender
    ) public payable onlyOwner returns (uint256) {
        // Ensure that only the collection creator can mint an NFT.
        require(_sender == collectionCreator, NFTErrors.ONLY_COLLECTION_CREATOR);
        // Ensure that the NFT URI is unique.
        require(uriExists[_tokenUri] == false, NFTErrors.NFT_URI_NOT_UNIQUE);
        // Ensure that the listing fees are present.
        require(msg.value > 0, NFTErrors.LISTING_FEES_MISSING);
        // Increment the token ID for the newly created NFT.
        nftsIds.increment();
        // Mint the NFT and transfer it to `collectionCreator`, who is now the owner.
        _safeMint(collectionCreator, nftsIds.current());
        // Set the provided `_tokenUri` for the newly created NFT.
        _setTokenURI(nftsIds.current(), _tokenUri);
        // Mark the URI as used.
        uriExists[_tokenUri] = true;
        // Send the listing fees to the marketplace owner wallet.
        owner.transfer(msg.value);

        // If the user has requested to put the NFT in sale.
        if (_putInSale) {
            // Ensure that the price is greater than 0.
            require(_price > 0, NFTErrors.NFT_PRICE_NOT_ZERO);
            // Update the NFT internal params.
            _nftUpdateInfo(nftsIds.current(), collectionCreator, _price, true);
            // Transfer ownership of the NFT from the creator to the Marketplace, which is now the owner.
            _transfer(collectionCreator, marketplaceScAdr, nftsIds.current());
            // Increment the NFT in sale counter.
            nftsInSale.increment();
        }
        // Return the newly created NFT ID.
        return nftsIds.current();
    }

    /// @dev Puts an NFT on sale.
    /// @param _nftId The ID of the NFT to put on sale.
    /// @param _price The sale price for the NFT.
    /// @param _sender The address of the sender calling the function.
    function putNftInSale(uint256 _nftId, uint256 _price, address _sender) public payable onlyOwner nftExists(_nftId) {
        // Ensure that only the owner of the NFT can put it on sale.
        require(_sender == ownerOf(_nftId), NFTErrors.ONLY_NFT_OWNER_SELL);
        // Transfer ownership of the NFT from the owner to the marketplace, which is now the owner.
        _transfer(_sender, marketplaceScAdr, _nftId);
        // Update internal NFT params.
        _nftUpdateInfo(_nftId, payable(_sender), _price, true);
        // Increment the number of NFTs in sale.
        nftsInSale.increment();
    }

    /// @dev Cancels the sale of an NFT.
    /// @param _nftId The ID of the NFT to cancel the sale for.
    /// @param _sender The address of the sender calling the function.
    function cancelSaleNft(uint256 _nftId, address _sender) public payable onlyOwner nftExists(_nftId) {
        // Ensure that the NFT is in sale.
        require(idToNftInfo[_nftId].isInSale == true, NFTErrors.NFT_IS_IN_NOT_SALE);
        // Ensure that only the seller can cancel the sale.
        require(_sender == idToNftInfo[_nftId].seller, NFTErrors.ONLY_NFT_SELLER_CANCEL_SELL);
        // Transfers the NFT ownership from the Marketplace to the seller.
        _transfer(marketplaceScAdr, idToNftInfo[_nftId].seller, _nftId);
        // Decrements the number of NFTs in sale.
        nftsInSale.decrement();
        // Update internal NFT params.
        _nftUpdateInfo(_nftId, payable(address(0)), 0, false);
    }

    /// @dev Allows a user to buy an NFT from the marketplace.
    /// @param _nftId The ID of the NFT being bought.
    /// @param _sender The address of the buyer.
    /// @param _markeplaceShare The percentage of the sale price to be paid to the marketplace owner.
    /// @param _artistShare The percentage of the sale price to be paid to the collection creator.
    /// @param _curatorShare The percentage of the sale price to be paid to the curator.
    /// @param _sellerShare The percentage of the sale price to be paid to the seller.*/
    function buyNft(
        uint256 _nftId,
        address _sender,
        uint256 _markeplaceShare,
        uint256 _artistShare,
        address _curationAdr,
        uint256 _curatorShare,
        uint256 _sellerShare
    ) public payable onlyOwner nftExists(_nftId) {
        // When this function is called marketplace have already tested the following elements
        // - _price != msg.value
        // Ensure that the nft is in sale
        require(idToNftInfo[_nftId].isInSale == true, NFTErrors.NFT_IS_IN_NOT_SALE);
        // Ensure that the buyer sent the correct price
        require(idToNftInfo[_nftId].price == msg.value, NFTErrors.BUY_PRICE_INCORRECT);
        // Update the NFT information.
        idToNftInfo[_nftId].isInSale = false;
        // Transfer the NFT ownership.
        _transfer(marketplaceScAdr, _sender, _nftId);
        // Decrement the NFT in sale count.
        nftsInSale.decrement();
        // Send Marketplace share to the market owner wallet if the address and amount are valid
        if (_markeplaceShare != 0 && owner != address(0)) {
            owner.transfer(_markeplaceShare);
        }

        // Send Artist share to the collection creator wallet if the address and amount are valid
        if (_artistShare != 0 && collectionCreator != address(0)) {
            collectionCreator.transfer(_artistShare);
        }

        // Send curator share to the curator wallet if the address and amount are valid
        if (_curatorShare != 0 && _curationAdr != address(0)) {
            payable(_curationAdr).transfer(_curatorShare);
        }

        // Send Seller share to seller wallet if the address and amount are valid
        if (_sellerShare != 0 && idToNftInfo[_nftId].seller != address(0)) {
            idToNftInfo[_nftId].seller.transfer(_sellerShare);
        }
    }

    /// @notice Returns the total number of NFTs that have been minted.
    /// @dev The function can only be called by the marketplace owner.
    /// @return The total number of NFTs that have been minted.

    function totalSupply() public view onlyOwner returns (uint256) {
        return nftsIds.current();
    }

    /// @notice Returns the total number of NFTs that are currently for sale.
    /// @dev The function can only be called by the marketplace owner.
    /// @return The total number of NFTs that are currently for sale.

    function totalInSell() public view onlyOwner returns (uint256) {
        return nftsInSale.current();
    }

    /// @notice Returns the address of the owner of the nft .
    /// @dev The function can only be called by the marketplace owner.
    /// @return The address of the owner of the NFT.

    function getNftOwner(uint256 _nftId) public view nftExists(_nftId) onlyOwner returns (address) {
        return ownerOf(_nftId);
    }
}

contract Collectiontst is Collection {
    using Counters for Counters.Counter;

    constructor(
        address _marketplaceScAdr,
        address payable _owner,
        address payable _collectionCreator,
        string memory _collectionName,
        string memory _symbol
    ) Collection(_marketplaceScAdr, _owner, _collectionCreator, _collectionName, _symbol) {}

    function getMarketplaceScAdr() public view returns (address) {
        return marketplaceScAdr;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getCollectionCreator() public view returns (address) {
        return collectionCreator;
    }

    function getNftSeller(uint16 _nftId) public view nftExists(_nftId) returns (address) {
        return idToNftInfo[_nftId].seller;
    }

    function getNftPrice(uint16 _nftId) public view nftExists(_nftId) returns (uint256) {
        return idToNftInfo[_nftId].price;
    }

    function getNftSaleStatus(uint16 _nftId) public view nftExists(_nftId) returns (bool) {
        return idToNftInfo[_nftId].isInSale;
    }
}
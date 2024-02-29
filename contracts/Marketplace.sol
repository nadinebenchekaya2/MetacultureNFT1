// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Collection.sol";
import "./NFTErrors.sol";

//import "hardhat/console.sol";

interface IMarketplaceConf {
    function getListingFees() external view returns (uint256);

    function setArtistRoyalties(address _collectionAdr, uint256 nftId, uint16 _artistRoyalties) external;

    function setCuratorRoyalties(address _collectionAdr, uint16 _curatorRoyalties) external;

    function getAllShares(
        address _collectionAdr,
        uint256 _nftId,
        uint256 _price
    ) external view returns (uint256, uint256, address, uint256, uint256);
}

/**
 * @title NFTMarketplace
 * @dev A contract for managing non-fungible token marketplaces.
 */
contract Marketplace {
    address payable private owner;
    address private marketplaceConfAdr;

    mapping(address => bool) private collections;

    // Events

    /// @dev Event emitted when payement is received.
    /// @param sender The address that sent the payement.
    /// @param amount The amount of payement sent.
    event Received(address sender, uint256 amount);

    /// @notice Emitted when a new NFT collection is added.
    /// @param collectionAdr The address of the collection.
    event CollectionAdded(address indexed collectionAdr);

    /// @notice Emitted when a new NFT is added to a collection.
    /// @param collectionAdr The address of the collection containing the NFT.
    /// @param nftId The ID of the created NFT.
    event NftAdded(address indexed collectionAdr, uint256 indexed nftId);

    /// @notice Emitted when an NFT is put up for sale.
    /// @param collectionAdr The address of the collection containing the NFT.
    /// @param nftId The ID of the NFT.
    event NftInSale(address indexed collectionAdr, uint256 indexed nftId);

    /// @notice Emitted when an NFT sale is cancelled.
    /// @param collectionAdr The address of the collection containing the NFT.
    /// @param nftId The ID of the NFT.
    event NftCancelledSell(address indexed collectionAdr, uint256 indexed nftId);

    /// @notice Emitted when an NFT is sold.
    /// @param collectionAdr The address of the collection containing the NFT.
    /// @param nftId The ID of the NFT.
    event NftBought(address indexed collectionAdr, uint256 indexed nftId);

    /// @notice Constructor for creating a new NFT marketplace.
    /// @param _marketplaceConfAdr The address of the Marketplace configuration contract.
    constructor(address _marketplaceConfAdr) {
        // Set the contract owner to the address that deployed the contract.
        owner = payable(msg.sender);
        // Create the Marketplace configuration contract.
        marketplaceConfAdr = _marketplaceConfAdr;
    }

    /// @notice Checks if a collection exists.
    /// @param _adr The address of the collection to check.
    function _collectionExists(address _adr) private view {
        // Check if the collection exists in the collections mapping.
        require(collections[_adr], NFTErrors.COLLECTION_NOT_EXIST);
    }

    /// @notice Checks if the caller is the contract owner.
    function _onlyOwner() private view {
        // Check if the caller is the contract owner.
        require(msg.sender == owner, NFTErrors.ONLY_MP_OWNER);
    }

    /// @notice Modifier to check that the collection exists.
    /// @param _collectionAdr The address of the collection.
    /// @dev Reverts if the collection does not exist.
    modifier collectionExists(address _collectionAdr) {
        // Check if the collection exists.
        _collectionExists(_collectionAdr);
        _;
    }

    /// @notice Modifier to check that the function can be called only by the owner.
    /// @dev Reverts if the caller is not the owner.
    modifier onlyOwner() {
        // Check if the caller is the owner.
        _onlyOwner();
        _;
    }

    /// @notice Creates a new NFT collection and marks it as created.
    /// @param _collectionName The name of the collection to create.
    /// @param _symbole The symbol of the collection.
    /// @return The address of the newly created collection.
    function createCollection(string memory _collectionName, string memory _symbole) public returns (address) {
        // Ensure that the collection name is not empty.
        require(bytes(_collectionName).length > 0, NFTErrors.COLLECTION_NAME_NOT_EMPTY);

        // Create a new instance of the NFTCollection contract.
        Collection newCollection = new Collection(
            payable(address(this)),
            owner,
            payable(msg.sender),
            _collectionName,
            _symbole
        );
        // Mark the collection as created.
        collections[address(newCollection)] = true;

        // Emit a "CollectionAdded" event.
        emit CollectionAdded(address(newCollection));
        // Return the address of the newly created collection.
        return address(newCollection);
    }

    /// @notice Creates a new NFT and adds it to the specified collection.
    /// @param _collectionAdr The address of the collection to add the NFT to.
    /// @param _nftUri The URI of the token metadata for the new NFT.
    /// @param _isForSale Boolean indicating if the NFT should be put up for sale.
    /// @param _price The price at which to sell the NFT (if `_isForSale` is true).
    /// @param _royaltiesArtist The percentage of royalties to be paid to the artist on each sale.
    /// @return nftId The ID of the newly created NFT.
    function createNft(
        bool _isForSale,
        uint16 _royaltiesArtist,
        address _collectionAdr,
        uint256 _price,
        string memory _nftUri
    ) public payable collectionExists(_collectionAdr) returns (uint256 nftId) {
        // Ensure that the NFT URI is not empty.
        require(bytes(_nftUri).length > 0, NFTErrors.NFT_URI_NOT_EMPTY);
        // Ensure that the listing fees are present.
        uint256 listingFees = IMarketplaceConf(marketplaceConfAdr).getListingFees();
        require(msg.value == listingFees, NFTErrors.LISTING_FEES_MISSING);
        // Ensure that the percentage of royalties is in range.
        require(_royaltiesArtist <= 10000, NFTErrors.ROYALTIES_RANGE_ERROR);
        // Ensure that if the NFT is for direct sale, the price is not zero.
        if (_isForSale) {
            require(_price > 0, NFTErrors.NFT_PRICE_NOT_ZERO);
        }
        // targetCollection will point to the NFT collection smart contract.
        Collection targetCollection = Collection(_collectionAdr);
        // Mint a new NFT and get its ID.
        nftId = targetCollection.mintNft{value: msg.value}(_isForSale, _price, _nftUri, msg.sender);
        // Set the artist royalties for the new NFT.
        IMarketplaceConf(marketplaceConfAdr).setArtistRoyalties(address(targetCollection), nftId, _royaltiesArtist);
        // Emit an "NftAdded" event.
        emit NftAdded(_collectionAdr, nftId);
        // Return the ID of the newly created NFT.
        return nftId;
    }

    /// @notice Puts an existing NFT from a specified collection up for sale.
    /// @param _collectionAdr The address of the NFT collection.
    /// @param _nftId The ID of the NFT to put up for sale.
    /// @param _price The price at which to sell the NFT.
    function sellNft(
        address _collectionAdr,
        uint256 _nftId,
        uint256 _price
    ) public payable collectionExists(_collectionAdr) {
        // Ensure that the price is not zero.
        require(_price > 0, NFTErrors.NFT_PRICE_NOT_ZERO);
        // Put the target NFT up for sale.
        Collection(_collectionAdr).putNftInSale(_nftId, _price, msg.sender);
        // Emit an "NftInSale" event.
        emit NftInSale(_collectionAdr, _nftId);
    }

    /// @notice Cancels the sale of an NFT that is already up for sale.
    /// @param _collectionAdr The address of the collection containing the NFT to cancel the sale.
    /// @param _nftId The ID of the NFT to cancel the sale for.
    function cancelSaleNft(
        address payable _collectionAdr,
        uint256 _nftId
    ) public payable collectionExists(_collectionAdr) {
        // Cancel the sale of the target NFT.
        Collection(_collectionAdr).cancelSaleNft(_nftId, msg.sender);
        // Emit a "cancelNftSell" event.
        emit NftCancelledSell(_collectionAdr, _nftId);
    }

    /// @notice Buys an NFT that is up for sale.
    /// @param _collectionAdr The address of the collection containing the NFT to buy.
    /// @param _nftId The ID of the NFT to buy.
    /// @param _price The price at which the NFT is being sold.
    function buyNft(
        address _collectionAdr,
        uint256 _nftId,
        uint256 _price
    ) public payable collectionExists(_collectionAdr) {
        // Ensure that the price is correct.
        require(msg.value == _price, NFTErrors.BUY_PRICE_INCORRECT);
        // Get the corresponding shares for this price.
        (
            uint256 markeplaceShare,
            uint256 artistShare,
            address curatorAdr,
            uint256 curatorShare,
            uint256 sellerShare
        ) = IMarketplaceConf(marketplaceConfAdr).getAllShares(_collectionAdr, _nftId, _price);
        // Buy the NFT.
        Collection(_collectionAdr).buyNft{value: msg.value}(
            _nftId,
            msg.sender,
            markeplaceShare,
            artistShare,
            curatorAdr,
            curatorShare,
            sellerShare
        );
        // Emit a "buyNft" event.
        emit NftBought(_collectionAdr, _nftId);
    }

    /// @notice Gets the total supply of NFTs in a collection.
    /// @param _collectionAdr The address of the collection to get the total supply for.
    /// @return The total supply of NFTs in the collection.
    function totalSupply(address _collectionAdr) public view collectionExists(_collectionAdr) returns (uint256) {
        return Collection(_collectionAdr).totalSupply();
    }

    /// @notice Gets the total number of NFTs in a collection that are up for sale.
    /// @param _collectionAdr The address of the collection to get the total number of NFTs in sale for.
    /// @return The total number of NFTs in the collection that are up for sale.
    function totalInSell(address _collectionAdr) public view collectionExists(_collectionAdr) returns (uint256) {
        return Collection(_collectionAdr).totalInSell();
    }

    /// @notice Returns the address of the marketplace owner.
    ///  @return The address of the marketplace owner.
    function getOwner() public view returns (address) {
        return owner;
    }

    /// @notice Returns the address of the owner of the nft .
    /// @param _collectionAdr The address of the collection to get the total number of NFTs in sale for.
    /// @param _nftId The Id of the target NFT
    /// @return The address of the owner of the NFT.
    function getNftOwner(
        address _collectionAdr,
        uint256 _nftId
    ) public view collectionExists(_collectionAdr) returns (address) {
        return Collection(_collectionAdr).getNftOwner(_nftId);
    }

    /// @notice Returns the current value of listing fees
    /// @return The listing fees of marketplace.
    function getCurrentListingFees() public view returns (uint256) {
        return IMarketplaceConf(marketplaceConfAdr).getListingFees();
    }

    /// @dev Fallback function that receives Ether and emits an event.
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
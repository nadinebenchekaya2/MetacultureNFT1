// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./NFTErrors.sol";

//import "hardhat/console.sol";

/**
 * @title MarketplaceConf
 * @dev A contract for managing non-fungible token marketplaces.
 */

contract MarketplaceConf {
    /// @notice The address of the owner of the NFT marketplace.
    address payable private owner;
    /// @notice The address of the Marketplace.
    address payable private marketplaceAdr;
    /// @notice The percentage of royalties to be paid to the marketplace on each sale.
    uint16 private royaltiesMarketplace;
    /// @notice The listing fee for adding an NFT to the marketplace.
    uint256 private listingFees;
    /// @notice Struct for storing artist royalties and curator wallet & royalties
    struct WalletAndRoyalties {
        address curatorWalletAdr; // The wallet address of the curator
        uint16 curatorRoyalties; // The royalties as a percentage (1 % = 100)
        mapping(uint256 => uint16) nftArtistRoyalties; // Mapping of NFT IDs to corresponding royalties
    }

    /// @dev Mapping to store a wallet address and royalties for each address
    mapping(address => WalletAndRoyalties) public royaltiesInfo;

    /// @notice Constructor for creating a new NFT marketplace configuration.
    /// @dev This function sets the contract owner to the address that deployed the contract, and initializes the listing fees and royalties marketplace values.
    /// @param _listingFees The value of the listing fees to be charged for each NFT listed for sale.
    /// @param _royaltiesMarketplace The percentage of the sale price that the marketplace owner will receive as royalties.
    constructor(uint256 _listingFees, uint16 _royaltiesMarketplace) {
        // Set the contract owner to the address that deployed the contract.
        owner = payable(msg.sender);
        // Initialize the listing fees and royalties marketplace values.
        listingFees = _listingFees;
        // Ensure that _royaltiesMarketplace are always under 100%
        require(_royaltiesMarketplace <= 10000, NFTErrors.ROYALTIES_RANGE_ERROR);
        royaltiesMarketplace = _royaltiesMarketplace;
    }

    /// @dev Event emitted when payement is received.
    /// @param sender The address that sent the payement.
    /// @param amount The amount of payement sent.
    event Received(address sender, uint256 amount);

    /// @notice Checks if themsg.sender is the marketplace owner or the NFT marketplace address.
    /// @dev This function is used to restrict access to certain functions to the marketplace owner or the NFT marketplace contract.
    function _onlyOwner() internal view {
        require(msg.sender == owner || msg.sender == marketplaceAdr, NFTErrors.ONLY_MP_OWNER);
    }

    /// @dev Modifier to check that the caller is the owner of the NFT marketplace.
    /// @notice Reverts if the caller is not the owner.
    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    /// @notice Sets the listing fees for adding an NFT to the marketplace.
    /// @param _listingFees The new listing fees.
    function setListingFees(uint256 _listingFees) public onlyOwner {
        listingFees = _listingFees;
    }

    /// @notice Gets the current listing fees for adding an NFT to the marketplace.
    /// @return The current listing fees.
    function getListingFees() public view returns (uint256) {
        return listingFees;
    }

    /// @notice Sets the percentage of royalties to be paid to the marketplace on each sale.
    /// @param _royaltiesMarketplace The new percentage of royalties for the marketplace.
    function setMarketplaceRoyalties(uint16 _royaltiesMarketplace) public onlyOwner {
        // Ensure that _royaltiesMarketplace are always under 100%
        require(_royaltiesMarketplace <= 10000, NFTErrors.ROYALTIES_RANGE_ERROR);
        royaltiesMarketplace = _royaltiesMarketplace;
    }

    /// @notice Gets the percentage of royalties currently set for the marketplace.
    /// @return The percentage of royalties for the marketplace.
    function getMarketplaceRoyalties() public view returns (uint16) {
        return royaltiesMarketplace;
    }

    /// @notice Sets the percentage of royalties to be paid to the artist for a specific NFT.
    /// @param _collectionAdr The address of the collection containing the NFT.
    /// @param _nftId The ID of the NFT.
    /// @param _artistRoyalties The new percentage of royalties for the artist.
    function setArtistRoyalties(address _collectionAdr, uint256 _nftId, uint16 _artistRoyalties) public onlyOwner {
        // Ensure that _artistRoyalties are always under 100%
        require(_artistRoyalties <= 10000, NFTErrors.ROYALTIES_RANGE_ERROR);
        royaltiesInfo[_collectionAdr].nftArtistRoyalties[_nftId] = _artistRoyalties;
    }

    /// @dev Returns the artist royalties for a specific NFT in a collection.
    /// @param _collectionAdr The address of the collection that contains the NFT.
    /// @param _nftId The ID of the NFT.
    function getArtistRoyalties(address _collectionAdr, uint256 _nftId) public view returns (uint16) {
        return royaltiesInfo[_collectionAdr].nftArtistRoyalties[_nftId];
    }

    /// @dev Sets the curator royalties for a collection.
    /// @param _collectionAdr The address of the collection for which to set the curator royalties.
    /// @param _curatorAdr Curator wallet address.
    /// @param _curatorRoyalties The percentage of royalties to be paid to the curator in basic points (1% = 100).
    function setCuratorRoyalties(
        address _collectionAdr,
        address _curatorAdr,
        uint16 _curatorRoyalties
    ) public onlyOwner {
        // Ensure that _curatorRoyalties are always under 100%
        require(_curatorRoyalties <= 10000, NFTErrors.ROYALTIES_RANGE_ERROR);
        royaltiesInfo[_collectionAdr].curatorWalletAdr = _curatorAdr;
        royaltiesInfo[_collectionAdr].curatorRoyalties = _curatorRoyalties;
    }

    /// @dev Returns the curator royalties for a specific collection.
    /// @param _collectionAdr The address of the collection for which to retrieve the curator royalties.
    function getCuratorRoyalties(address _collectionAdr) public view returns (address, uint256) {
        return (royaltiesInfo[_collectionAdr].curatorWalletAdr, royaltiesInfo[_collectionAdr].curatorRoyalties);
    }

    /// @dev Calculates and returns the shares for each party when an NFT is sold at a given price.
    /// @param _collectionAdr The address of the NFT collection.
    /// @param _nftId The ID of the NFT being sold.
    /// @param _price The sale price of the NFT.
    /// @return markeplaceShare The share of the sale price that goes to the marketplace.
    /// @return artistShare The share of the sale price that goes to the NFT artist.
    /// @return curatorAdr The wallet address of the curator
    /// @return curatorShare The share of the sale price that goes to the NFT collection curator.
    /// @return sellerShare The share of the sale price that goes to the NFT seller.
    function getAllShares(
        address _collectionAdr,
        uint256 _nftId,
        uint256 _price
    )
        public
        view
        onlyOwner
        returns (
            uint256 markeplaceShare,
            uint256 artistShare,
            address curatorAdr,
            uint256 curatorShare,
            uint256 sellerShare
        )
    {
        // Calculate the sum of all royalties.
        uint256 sumOfRoyalties = royaltiesMarketplace +
            royaltiesInfo[_collectionAdr].nftArtistRoyalties[_nftId] +
            royaltiesInfo[_collectionAdr].curatorRoyalties;
        // Ensure that the sum of royalties is less than 100%.
        require(sumOfRoyalties < 10000, NFTErrors.SUM_ROYALTIES_RANGE_ERROR);
        // Calculate the marketplace share.
        markeplaceShare = (_price * royaltiesMarketplace) / 10000;
        // Calculate the artist share.
        artistShare = (_price * royaltiesInfo[_collectionAdr].nftArtistRoyalties[_nftId]) / 10000;
        // Get the curator address
        curatorAdr = royaltiesInfo[_collectionAdr].curatorWalletAdr;
        // Calculate the curator share.
        curatorShare = (_price * royaltiesInfo[_collectionAdr].curatorRoyalties) / 10000;
        // Calculate the seller share.
        sellerShare = _price - markeplaceShare - artistShare - curatorShare;
    }

    /// @notice Returns the address of the marketplace owner.
    ///  @dev This function can be called by any user.
    ///  @return The address of the marketplace owner.
    function getOwner() public view returns (address) {
        return owner;
    }

    /// @notice Sets the address of the NFT marketplace.
    /// @dev This function can only be called by the marketplace owner.
    /// @param _marketplaceAdr The new address of the NFT marketplace.
    function setMarketplaceAdr(address payable _marketplaceAdr) public onlyOwner {
        marketplaceAdr = _marketplaceAdr;
    }

    /// @notice Returns the address of the marketplace smart contract.
    /// @dev This function can only be called by the marketplace owner.
    /// @return The address of the marketplace smart contract.
    function getMarketplaceAdr() public view onlyOwner returns (address) {
        return marketplaceAdr;
    }

    /// @dev Fallback function that receives Ether and emits an event.
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
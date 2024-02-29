// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// @title NFTErrors
/// @dev A library that contains all of the possible error messages for the NFT marketplace.

library NFTErrors {
    string internal constant ONLY_MP_OWNER = "Only the Marketplace owner is allowed to perform this action";
    string internal constant ONLY_NFT_OWNER_SELL = "Only NFT owner can put it in sale";
    string internal constant ONLY_NFT_SELLER_CANCEL_SELL = "Only NFT seller can cancel the in sale";
    string internal constant ONLY_COLLECTION_CREATOR = "Only collection creator can mint NFT";
    string internal constant COLLECTION_NAME_NOT_EMPTY = "The collection name should not be an empty string";
    string internal constant COLLECTION_NOT_READY = "This collection does not exist yet";
    string internal constant NFT_URI_NOT_EMPTY = "The NFT uri should not be empty";
    string internal constant NFT_URI_NOT_UNIQUE = "The NFT uri already used in this collection";
    string internal constant NFT_PRICE_NOT_ZERO = "The sale price must be greater than 0";
    string internal constant NFT_NOT_EXIST = "NFT does not exist";
    string internal constant COLLECTION_NOT_EXIST = "Collection does not exist";
    string internal constant NFT_IS_IN_SALE = "The NFT is already in sale";
    string internal constant NFT_IS_IN_NOT_SALE = "The NFT is not in sale";
    string internal constant NFT_URI_USED = "Token URI already used";
    string internal constant LISTING_FEES_MISSING = "listing fees are missing";
    string internal constant BUY_PRICE_INCORRECT = "To complete the purchase please provide the correct price";
    string internal constant ROYALTIES_RANGE_ERROR = "Royalties percentage cannot be greater than 100%";
    string internal constant SUM_ROYALTIES_RANGE_ERROR = "Sum of all royalties cannot be greater than 100%";
    string internal constant MP_CONF_ERROR = "Marketplace configuration is net yet performed";
}
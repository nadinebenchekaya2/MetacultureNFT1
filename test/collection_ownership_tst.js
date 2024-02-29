const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const defaultListingFees = ethers.utils.parseUnits("0.1", "ether");
const defaultNftPrice = ethers.utils.parseUnits("1", "ether");
const defaultMarketplaceRoyalties = 200; // 2%
const defaultArtistRoyalties = 220; // 2,2 %

describe("collection Ownership", function () {
  async function deployCollectionFixture() {
    // Contracts are deployed using the first signer/account by default
    const [
      User0Account,
      User1Account,
      User2Account,
      User3Account,
      User4Account,
    ] = await ethers.getSigners();
    const Collection = await ethers.getContractFactory("Collectiontst");
    const collection = await Collection.deploy(
      User0Account.address, // => _marketplaceScAdr
      User0Account.address, // => Owner
      User1Account.address, // => _collectionCreatorAdr
      "Azure", // => _collectionName
      "az" // => => _collectionSymbol
    );

    await collection.deployed();

    // Fixtures can return anything you consider useful for your tests
    return {
      collection,
      User0Account,
      User1Account,
      User2Account,
      User3Account,
      User4Account,
    };
  }
  it("User 1 Create 1 Collection and 2 NFTs not in sale, the owner must by the collection creator ", async function () {
    const { collection, User1Account } = await loadFixture(
      deployCollectionFixture
    );
    // create two nfts
    await collection.mintNft(
      false,
      defaultNftPrice,
      "DueToData",
      User1Account.address,
      {
        value: defaultListingFees,
      }
    );

    await collection.mintNft(
      false,
      defaultNftPrice,
      "Speedline",
      User1Account.address,
      {
        value: defaultListingFees,
      }
    );

    owner1 = await collection.getNftOwner(1);
    owner2 = await collection.getNftOwner(2);

    expect(owner1).to.be.equal(User1Account.address);
    expect(owner2).to.be.equal(User1Account.address);
  });

  it("User 1 Create 1 Collection and 2 NFTs in sale, the owner must by the Marketplace owner ", async function () {
    const { collection, User0Account, User1Account } = await loadFixture(
      deployCollectionFixture
    );
    // create two nfts
    await collection.mintNft(
      true,
      defaultNftPrice,
      "DueToData",
      User1Account.address,
      {
        value: defaultListingFees,
      }
    );

    await collection.mintNft(
      true,
      defaultNftPrice,
      "Speedline",
      User1Account.address,
      {
        value: defaultListingFees,
      }
    );

    owner1 = await collection.getNftOwner(1);
    owner2 = await collection.getNftOwner(2);

    expect(owner1).to.be.equal(User0Account.address);
    expect(owner2).to.be.equal(User0Account.address);
  });

  it("Account2 and 3 buy the NFTs they must be the owner ", async function () {
    const {
      collection,
      User0Account,
      User1Account,
      User2Account,
      User3Account,
    } = await loadFixture(deployCollectionFixture);
    // create two nfts
    await collection.mintNft(
      true,
      defaultNftPrice,
      "DueToData",
      User1Account.address,
      {
        value: defaultListingFees,
      }
    );

    await collection.mintNft(
      true,
      defaultNftPrice,
      "Speedline",
      User1Account.address,
      {
        value: defaultListingFees,
      }
    );

    await collection.buyNft(
      1,
      User2Account.address,
      0,
      0,
      User3Account.address,
      0,
      0,
      {
        value: defaultNftPrice,
      }
    );
    await collection.buyNft(
      2,
      User3Account.address,
      0,
      0,
      User3Account.address,
      0,
      0,
      {
        value: defaultNftPrice,
      }
    );

    owner1 = await collection.getNftOwner(1);
    owner2 = await collection.getNftOwner(2);
    expect(owner1).to.be.equal(User2Account.address);
    expect(owner2).to.be.equal(User3Account.address);
  });

  it("Account2 and 3 put in sale the NFT => marketplace is the onwer ", async function () {
    const {
      collection,
      User0Account,
      User1Account,
      User2Account,
      User3Account,
    } = await loadFixture(deployCollectionFixture);
    // create two nfts
    await collection.mintNft(
      true,
      defaultNftPrice,
      "DueToData",
      User1Account.address,
      {
        value: defaultListingFees,
      }
    );

    await collection.mintNft(
      true,
      defaultNftPrice,
      "Speedline",
      User1Account.address,
      {
        value: defaultListingFees,
      }
    );

    await collection.buyNft(
      1,
      User2Account.address,
      0,
      0,
      User3Account.address,
      0,
      0,
      {
        value: defaultNftPrice,
      }
    );
    await collection.buyNft(
      2,
      User3Account.address,
      0,
      0,
      User3Account.address,
      0,
      0,
      {
        value: defaultNftPrice,
      }
    );

    // function putNftInSale(uint256 _nftId, uint256 _price, address _sender) public payable onlyOwner nftExists(_nftId) {
    await collection.putNftInSale(1, defaultNftPrice, User2Account.address);
    await collection.putNftInSale(2, defaultNftPrice, User3Account.address);

    owner1 = await collection.getNftOwner(1);
    owner2 = await collection.getNftOwner(2);
    expect(owner1).to.be.equal(User0Account.address);
    expect(owner2).to.be.equal(User0Account.address);
  });
});
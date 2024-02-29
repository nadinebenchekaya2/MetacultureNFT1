const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const defaultListingFees = ethers.utils.parseUnits("0.1", "ether");
const defaultNftPrice = ethers.utils.parseUnits("1", "ether");
const defaultMarketplaceRoyalties = 200; // 2%
const defaultArtistRoyalties = 220; // 2,2 %

describe("collection", function () {
  async function collectionFixture() {
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
    return {
      collection,
      User0Account,
      User1Account,
      User2Account,
      User3Account,
      User4Account,
    };
  }
  describe("Initial state", function () {
    it("Marketplace smart contract adr is correctly set", async function () {
      const { collection, User0Account } = await loadFixture(collectionFixture);
      expect(await collection.getMarketplaceScAdr()).to.equal(
        User0Account.address
      );
    });
    it("Owner adr is correctly set", async function () {
      const { collection, User0Account } = await loadFixture(collectionFixture);
      expect(await collection.getOwner()).to.equal(User0Account.address);
    });
    it("collectionCreator adr is correctly set", async function () {
      const { collection, User1Account } = await loadFixture(collectionFixture);
      expect(await collection.getCollectionCreator()).to.equal(
        User1Account.address
      );
    });
  });

  describe("mintNft()", function () {
    it("when caller is not the marketplace smart contract the transaction is reverted with message", async function () {
      const { collection, User1Account, User2Account } = await loadFixture(
        collectionFixture
      );
      await expect(
        collection
          .connect(User1Account)
          .mintNft(
            false,
            defaultNftPrice,
            "www.google.com",
            User2Account.address
          )
      ).to.be.revertedWith(
        "Only the Marketplace owner is allowed to perform this action"
      );
    });

    it("when sender is not the creator of the collection the transaction is reverted with message", async function () {
      const { collection, User0Account, User1Account, User2Account } =
        await loadFixture(collectionFixture);
      await expect(
        collection.mintNft(
          false,
          defaultNftPrice,
          "www.google.com",
          User2Account.address
        )
      ).to.be.revertedWith("Only collection creator can mint NFT");
    });

    it("When token uri are duplicated , transaction is reverted with message", async function () {
      const { collection, User0Account, User1Account } = await loadFixture(
        collectionFixture
      );
      await collection.mintNft(
        false,
        defaultNftPrice,
        "DueToData",
        User1Account.address,
        { value: defaultListingFees }
      );
      await expect(
        collection.mintNft(
          false,
          defaultNftPrice,
          "DueToData",
          User1Account.address,
          { value: defaultListingFees }
        )
      ).to.be.revertedWith("The NFT uri already used in this collection");
    });

    it("When a new nft is minted, the collection size is incremented by 1", async function () {
      const { collection, User0Account, User1Account } = await loadFixture(
        collectionFixture
      );
      const sizeBefore = await collection.totalSupply();
      await collection.mintNft(
        false,
        defaultNftPrice,
        "DueToData",
        User1Account.address,
        { value: defaultListingFees }
      );
      const sizeAfter = await collection.totalSupply();
      await expect(sizeAfter - sizeBefore).equal(1);
    });

    it("When a new nft is minted, the nft owner is set to collection creator", async function () {
      const { collection, User0Account, User1Account } = await loadFixture(
        collectionFixture
      );
      await collection.mintNft(
        false,
        defaultNftPrice,
        "DueToData",
        User1Account.address,
        { value: defaultListingFees }
      );
      const nftOwner = await collection.getNftOwner(1);
      const collectionCreator = await collection.getCollectionCreator();
      await expect(nftOwner).equal(collectionCreator);
    });

    it("When nft is not put directly in sale, the price could be 0", async function () {
      const { collection, User1Account } = await loadFixture(collectionFixture);
      expect(
        await collection.mintNft(false, 0, "DueToData", User1Account.address, {
          value: defaultListingFees,
        })
      ).not.to.be.reverted;
    });

    it("When nft is put directly in sale and the price is 0, the transaction is reverted", async function () {
      const { collection, User1Account } = await loadFixture(collectionFixture);
      await expect(
        collection.mintNft(true, 0, "DueToData", User1Account.address, {
          value: defaultListingFees,
        })
      ).to.be.revertedWith("The sale price must be greater than 0");
    });

    it("When nft is put directly in sale, if no listing fees provided, the transaction will be reverted with message", async function () {
      const { collection, User1Account } = await loadFixture(collectionFixture);
      await expect(
        collection.mintNft(
          true,
          defaultNftPrice,
          "DueToData",
          User1Account.address
        )
      ).to.be.revertedWith("listing fees are missing");
    });

    it("When nft is put directly in sale, listing fees are provided aNd the price is > 0 the transaction must not be reverted", async function () {
      const { collection, User0Account, User1Account } = await loadFixture(
        collectionFixture
      );
      await expect(
        collection.mintNft(true, 123123, "DueToData", User1Account.address, {
          value: defaultListingFees,
        })
      ).not.be.reverted;
    });

    it("When nft is correctly minted, internal nft params are correctly set owner, creator,  price,  ", async function () {
      const { collection, User0Account, User1Account, User4Account } =
        await loadFixture(collectionFixture);

      await collection.mintNft(
        true,
        defaultNftPrice,
        "DueToData",
        User1Account.address,
        {
          value: defaultListingFees,
        }
      );

      expect(await collection.getNftOwner(1)).to.equal(User0Account.address);
      expect(await collection.getNftSeller(1)).to.equal(User1Account.address);
      expect(await collection.getNftPrice(1)).to.equal(defaultNftPrice);
      expect(await collection.getNftSaleStatus(1)).to.equal(true);
    });

    it("When nft is correctly minted, the number of nft in sale is incremented by 1", async function () {
      const { collection, User0Account, User1Account } = await loadFixture(
        collectionFixture
      );
      const before = await collection.totalInSell();
      await collection.mintNft(
        true,
        defaultNftPrice,
        "DueToData",
        User1Account.address,
        { value: defaultListingFees }
      );
      const after = await collection.totalInSell();
      expect(after - before).equal(1);
    });

    it("When nft is correctly minted, the id of the new nft is returned", async function () {
      const { collection, User0Account, User1Account } = await loadFixture(
        collectionFixture
      );
      const newNftId = await collection.mintNft(
        true,
        defaultNftPrice,
        "DueToData",
        User1Account.address,
        { value: defaultListingFees }
      );
      const receipt = await newNftId.wait();
      const receivedId = receipt.events[1].args["tokenId"].toNumber();
      expect(receivedId).equal(1);
    });
  });

  describe("putNftInSale()", function () {
    it("when caller is not the marketplace smart contract the transaction is reverted with message", async function () {
      const { collection, User1Account } = await loadFixture(collectionFixture);
      await expect(
        collection
          .connect(User1Account)
          .putNftInSale(55, 123123, User1Account.address)
      ).to.be.revertedWith(
        "Only the Marketplace owner is allowed to perform this action"
      );
    });

    it("if the nfd id does not exist then the transaction is reverted with message", async function () {
      const { collection, User1Account } = await loadFixture(collectionFixture);
      await expect(
        collection.putNftInSale(55, 123123, User1Account.address)
      ).to.be.revertedWith("NFT does not exist");
    });

    it("if id exist but it is not the owner then the transaction is reverted with message", async function () {
      const { collection, User1Account, User2Account } = await loadFixture(
        collectionFixture
      );
      await collection.mintNft(
        false,
        defaultNftPrice,
        "DueToData",
        User1Account.address,
        { value: defaultListingFees }
      );
      await expect(
        collection.putNftInSale(1, 123123, User2Account.address)
      ).to.be.revertedWith("Only NFT owner can put it in sale");
    });

    it("if the nft id and the owner are ok then the nft params should be correctly updated", async function () {
      const { collection, User0Account, User1Account, User2Account } =
        await loadFixture(collectionFixture);
      await collection.mintNft(
        false,
        defaultNftPrice,
        "DueToData",
        User1Account.address,
        { value: defaultListingFees }
      );
      await collection.putNftInSale(1, defaultNftPrice, User1Account.address);
      expect(await collection.getNftOwner(1)).to.equal(User0Account.address);
      expect(await collection.getNftSeller(1)).to.equal(User1Account.address);
      expect(await collection.getNftPrice(1)).to.equal(defaultNftPrice);
      expect(await collection.getNftSaleStatus(1)).to.equal(true);
    });

    it("if the nft id, the owner and the price are ok then the number of nfts in sale should be incremented by 1", async function () {
      const { collection, User1Account } = await loadFixture(collectionFixture);
      await collection.mintNft(
        false,
        defaultNftPrice,
        "DueToData",
        User1Account.address,
        { value: defaultListingFees }
      );
      const before = await collection.totalInSell();
      await collection.putNftInSale(1, 123123123, User1Account.address);
      const after = await collection.totalInSell();
      expect(after - before).equal(1);
    });
  });

  describe("cancelSaleNft()", function () {
    it("when caller is not the marketplace smart contract the transaction is reverted with message", async function () {
      const { collection, User1Account } = await loadFixture(collectionFixture);
      await expect(
        collection.connect(User1Account).cancelSaleNft(55, User1Account.address)
      ).to.be.revertedWith(
        "Only the Marketplace owner is allowed to perform this action"
      );
    });

    it("if the nfd id does not exist then the transaction is reverted with message", async function () {
      const { collection, User1Account } = await loadFixture(collectionFixture);
      await expect(
        collection.cancelSaleNft(55, User1Account.address)
      ).to.be.revertedWith("NFT does not exist");
    });

    it("if the nfd id exists but the NFT is not in sale then the transaction is reverted with message", async function () {
      const { collection, User1Account } = await loadFixture(collectionFixture);
      await collection.mintNft(
        false,
        defaultNftPrice,
        "DueToData",
        User1Account.address,
        { value: defaultListingFees }
      );
      await expect(
        collection.cancelSaleNft(1, User1Account.address)
      ).to.be.revertedWith("The NFT is not in sale");
    });

    it("if the nfd id exists, NFT is in sale but it is not the seller then the transaction is reverted with message", async function () {
      const { collection, User1Account, User2Account } = await loadFixture(
        collectionFixture
      );
      await collection.mintNft(
        true,
        defaultNftPrice,
        "DueToData",
        User1Account.address,
        { value: defaultListingFees }
      );
      await expect(
        collection.cancelSaleNft(1, User2Account.address)
      ).to.be.revertedWith("Only NFT seller can cancel the in sale");
    });

    it("if the nfd id exists, NFT is in sale and the seller then the nft in sale counter is decremented by 1", async function () {
      const { collection, User1Account } = await loadFixture(collectionFixture);
      await collection.mintNft(
        true,
        defaultNftPrice,
        "DueToData",
        User1Account.address,
        { value: defaultListingFees }
      );

      const before = await collection.totalInSell();
      await collection.cancelSaleNft(1, User1Account.address);
      const after = await collection.totalInSell();
      expect(before - after).equal(1);
    });

    it("if the nfd id exists, NFT is in sale and the seller then nft params are correctly updated", async function () {
      const { collection, User1Account } = await loadFixture(collectionFixture);
      await collection.mintNft(
        true,
        defaultNftPrice,
        "DueToData",
        User1Account.address,
        { value: defaultListingFees }
      );
      await collection.cancelSaleNft(1, User1Account.address);
      expect(await collection.getNftOwner(1)).equal(User1Account.address);
      expect(await collection.getNftSeller(1)).equal(
        "0x0000000000000000000000000000000000000000"
      );
      expect(await collection.getNftPrice(1)).equal(0);
      expect(await collection.getNftSaleStatus(1)).equal(false);
    });
  });

  describe("buyNft()", function () {
    it("when caller is not the marketplace smart contract the transaction is reverted with message", async function () {
      const { collection, User1Account } = await loadFixture(collectionFixture);
      await expect(
        collection
          .connect(User1Account)
          .buyNft(55, User1Account.address, 0, 0, User1Account.address, 0, 0)
      ).to.be.revertedWith(
        "Only the Marketplace owner is allowed to perform this action"
      );
    });

    it("if the nfd id does not exist then the transaction is reverted with message", async function () {
      const { collection, User1Account } = await loadFixture(collectionFixture);
      await expect(
        collection.buyNft(
          55,
          User1Account.address,
          0,
          0,
          User1Account.address,
          0,
          0
        )
      ).to.be.revertedWith("NFT does not exist");
    });

    it("if the nfd id exist but it is not in sale then the transaction is reverted with message", async function () {
      const { collection, User1Account, User2Account } = await loadFixture(
        collectionFixture
      );
      await collection.mintNft(
        true,
        defaultNftPrice,
        "DueToData",
        User1Account.address,
        { value: defaultListingFees }
      );
      await collection.cancelSaleNft(1, User1Account.address);
      await expect(
        collection.buyNft(
          1,
          User2Account.address,
          0,
          0,
          User1Account.address,
          0,
          0
        )
      ).to.be.revertedWith("The NFT is not in sale");
    });

    it("if the nfd id exist and it is in sale but the price is incorrect then the transaction is reverted with message", async function () {
      const { collection, User1Account, User2Account } = await loadFixture(
        collectionFixture
      );
      await collection.mintNft(
        true,
        defaultNftPrice,
        "DueToData",
        User1Account.address,
        {
          value: defaultListingFees,
        }
      );
      await expect(
        collection.buyNft(
          1,
          User2Account.address,
          0,
          0,
          User1Account.address,
          0,
          0
        )
      ).to.be.revertedWith(
        "To complete the purchase please provide the correct price"
      );
    });

    it("if the nfd id exist and it is in sale but the price is correct then the transaction will not be reverted ", async function () {
      const { collection, User1Account, User2Account } = await loadFixture(
        collectionFixture
      );
      await collection.mintNft(
        true,
        defaultNftPrice,
        "DueToData",
        User1Account.address,
        {
          value: defaultListingFees,
        }
      );
      await expect(
        collection.buyNft(
          1,
          User2Account.address,
          0,
          0,
          User1Account.address,
          0,
          0,
          {
            value: defaultNftPrice,
          }
        )
      ).not.to.be.reverted;
    });

    it("if the nfd id exist, it is in sale and the price is correct then number of nft in sales will be decrement by 1", async function () {
      const { collection, User1Account, User2Account } = await loadFixture(
        collectionFixture
      );
      await collection.mintNft(
        true,
        defaultNftPrice,
        "DueToData",
        User1Account.address,
        {
          value: defaultListingFees,
        }
      );

      const nbrNftInSaleBefore = await collection.totalInSell();
      await collection.buyNft(
        1,
        User2Account.address,
        0,
        0,
        User1Account.address,
        0,
        0,
        {
          value: defaultNftPrice,
        }
      );
      const nbrNftInSaleAfter = await collection.totalInSell();
      expect(nbrNftInSaleAfter).to.equal(nbrNftInSaleBefore.sub(1));
    });
  });

  describe("totalSupply()", function () {
    it("when caller is not the marketplace smart contract the transaction is reverted with message", async function () {
      const { collection, User1Account } = await loadFixture(collectionFixture);
      await expect(
        collection.connect(User1Account).totalSupply()
      ).to.be.revertedWith(
        "Only the Marketplace owner is allowed to perform this action"
      );
    });
  });

  describe("totalInSell()", function () {
    it("when caller is not the marketplace smart contract the transaction is reverted with message", async function () {
      const { collection, User1Account } = await loadFixture(collectionFixture);
      await expect(
        collection.connect(User1Account).totalInSell()
      ).to.be.revertedWith(
        "Only the Marketplace owner is allowed to perform this action"
      );
    });
  });
});
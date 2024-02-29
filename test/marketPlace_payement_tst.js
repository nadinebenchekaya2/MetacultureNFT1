const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { string } = require("hardhat/internal/core/params/argumentTypes");
const defaultListingFees = ethers.utils.parseUnits("0.1", "ether");
const defaultNftPrice = ethers.utils.parseUnits("1", "ether");
const defaultMarketplaceRoyalties = 200; // 2%
const defaultArtistRoyalties = 220; // 2%
const defaultCuratorRoyalties = 145; // 1.45%

describe("marketPlace Payements", function () {
  async function marketplaceFixture() {
    // Contracts are deployed using the first signer/account by default
    const [
      User0Account,
      User1Account,
      User2Account,
      User3Account,
      User4Account,
    ] = await ethers.getSigners();
    // Deploy the market config first
    const MarketplaceCfg = await ethers.getContractFactory("MarketplaceConf");
    const marketplaceCfg = await MarketplaceCfg.deploy(
      defaultListingFees,
      defaultMarketplaceRoyalties
    );

    // Deploy the Marketplace
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(marketplaceCfg.address);

    // register Marketplace in MarketplaceCong
    await marketplaceCfg.setMarketplaceAdr(marketplace.address);
    return {
      marketplace,
      marketplaceCfg,
      User0Account,
      User1Account,
      User2Account,
      User3Account,
      User4Account,
    };
  }

  describe("Listing Fees payement", function () {
    it("When NFT is correctly minted, listing fees and gaz fees are substracted from creator balance", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
      } = await loadFixture(marketplaceFixture);
      // Create list
      const tx1 = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rx1 = await tx1.wait();
      const tstcollectionAdr = rx1.events[0].args.collectionAdr;
      // configure curator royalties
      marketplaceCfg.setCuratorRoyalties(
        tstcollectionAdr,
        User2Account.address,
        defaultCuratorRoyalties
      );
      // get balance of creator address
      const balanceBefore = await ethers.provider.getBalance(
        User1Account.address
      );
      // Mint an NFT
      const tx2 = await marketplace
        .connect(User1Account)
        .createNft(
          false,
          defaultArtistRoyalties,
          tstcollectionAdr,
          defaultNftPrice,
          "www.goole.com",
          { value: defaultListingFees }
        );
      const rc2 = await tx2.wait();
      // get the total gas spent for the mint transaction
      const gasSpent = rc2.gasUsed.mul(rc2.effectiveGasPrice);
      // get the current balance
      const balanceAfter = await ethers.provider.getBalance(
        User1Account.address
      );
      // The minter should pay the defaultListingFees and gasSpent
      expectedDecrease = defaultListingFees.add(gasSpent);
      // The new balance must be equal to balanceBefore - defaultListingFees - gasSpent
      expect(balanceAfter).be.equal(balanceBefore.sub(expectedDecrease));
    });

    it("When NFT is correctly minted, listing fees are transferred to market owner wallet address", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
      } = await loadFixture(marketplaceFixture);
      // Create list
      const tx1 = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rx1 = await tx1.wait();
      const tstcollectionAdr = rx1.events[0].args.collectionAdr;
      // configure curator royalties
      marketplaceCfg.setCuratorRoyalties(
        tstcollectionAdr,
        User2Account.address,
        defaultCuratorRoyalties
      );

      // get balance of creator address
      const balanceBefore = await ethers.provider.getBalance(
        User0Account.address
      );
      // Mint an NFT
      const tx2 = await marketplace
        .connect(User1Account)
        .createNft(
          false,
          defaultArtistRoyalties,
          tstcollectionAdr,
          defaultNftPrice,
          "www.goole.com",
          { value: defaultListingFees }
        );
      const rc2 = await tx2.wait();
      // get the current balance
      const balanceAfter = await ethers.provider.getBalance(
        User0Account.address
      );
      // The new balance must be equal to balanceBefore + defaultListingFees
      expect(balanceAfter).be.equal(balanceBefore.add(defaultListingFees));
    });
  });

  describe("Marketplace and Artist Royalties payement", function () {
    it("When NFT is sold the buyer pays only the price of NFT and the gas fees", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
        User3Account,
        User4Account,
      } = await loadFixture(marketplaceFixture);
      // Create list
      const tx1 = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rx1 = await tx1.wait();
      const tstcollectionAdr = rx1.events[0].args.collectionAdr;
      // configure curator royalties
      marketplaceCfg.setCuratorRoyalties(
        tstcollectionAdr,
        User4Account.address,
        defaultCuratorRoyalties
      );

      // Mint an NFT
      const tx2 = await marketplace
        .connect(User1Account)
        .createNft(
          true,
          defaultArtistRoyalties,
          tstcollectionAdr,
          defaultNftPrice,
          "www.goole.com",
          { value: defaultListingFees }
        );
      const rc2 = await tx2.wait();
      // get balance of buyer
      const balanceBefore = await ethers.provider.getBalance(
        User2Account.address
      );
      // User 2 buy the NFT
      const tx3 = await marketplace
        .connect(User2Account)
        .buyNft(tstcollectionAdr, 1, defaultNftPrice, {
          value: defaultNftPrice,
        });
      const rc3 = await tx3.wait();
      // get the total gas spent for the buy transaction
      const gasSpent = rc3.gasUsed.mul(rc3.effectiveGasPrice);
      // get the current balance
      const balanceAfter = await ethers.provider.getBalance(
        User2Account.address
      );
      // The buyer should pay the defaultNftPrice and gasSpent
      expectedDecrease = defaultNftPrice.add(gasSpent);
      // The new balance must be equal to balanceBefore - defaultListingFees - gasSpent
      expect(balanceAfter).be.equal(balanceBefore.sub(expectedDecrease));
    });

    it("When NFT is sold, the seller, the Market place, the Curator and the Artist receive the correct payements", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
        User3Account,
        User4Account,
      } = await loadFixture(marketplaceFixture);
      // Create list => User 1 is the creator => Artist
      //             => User 4 is the curator
      const tx1 = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rx1 = await tx1.wait();
      const tstcollectionAdr = rx1.events[0].args.collectionAdr;
      // Configure
      marketplaceCfg.setCuratorRoyalties(
        tstcollectionAdr,
        User4Account.address,
        defaultCuratorRoyalties
      );
      // Mint an NFT
      const tx2 = await marketplace
        .connect(User1Account)
        .createNft(
          true,
          defaultArtistRoyalties,
          tstcollectionAdr,
          defaultNftPrice,
          "www.goole.com",
          { value: defaultListingFees }
        );
      const rc2 = await tx2.wait();
      // User 2 buy the NFT then put it back in sale
      const tx3 = await marketplace
        .connect(User2Account)
        .buyNft(tstcollectionAdr, 1, defaultNftPrice, {
          value: defaultNftPrice,
        });
      const rc3 = await tx3.wait();

      const tx4 = await marketplace
        .connect(User2Account)
        .sellNft(tstcollectionAdr, 1, defaultNftPrice);
      const rc4 = await tx4.wait();

      // User 3 buys the NFT
      // Marketplace owner  =>  User 0
      // Artist             =>  User 1
      // Seller             =>  User 2
      // buyer              =>  User 3
      // Curator            =>  User 4
      const MpBefore = await ethers.provider.getBalance(User0Account.address);
      const ArtBefore = await ethers.provider.getBalance(User1Account.address);
      const SelBefore = await ethers.provider.getBalance(User2Account.address);
      const BuyBefore = await ethers.provider.getBalance(User3Account.address);
      const CurBefore = await ethers.provider.getBalance(User4Account.address);

      // User 3 buy the NFT
      const tx5 = await marketplace
        .connect(User3Account)
        .buyNft(tstcollectionAdr, 1, defaultNftPrice, {
          value: defaultNftPrice,
        });
      const rc5 = await tx5.wait();

      // get the total gas spent for the buy transaction
      const gasSpent = rc5.gasUsed.mul(rc5.effectiveGasPrice);
      // get the current balances

      const MpAfter = await ethers.provider.getBalance(User0Account.address);
      const ArtAfter = await ethers.provider.getBalance(User1Account.address);
      const SelAfter = await ethers.provider.getBalance(User2Account.address);
      const BuyAfter = await ethers.provider.getBalance(User3Account.address);
      const CurAfter = await ethers.provider.getBalance(User4Account.address);

      // Market place receive defaultMarketplaceRoyalties (2%) of the transaction
      expect(MpAfter).to.be.equal(
        MpBefore.add(
          defaultNftPrice.mul(defaultMarketplaceRoyalties).div(10000)
        )
      );

      // Artist receive defaultArtistRoyalties (2,2%) of the transaction
      expectArt = ArtBefore.add(
        defaultNftPrice.mul(defaultArtistRoyalties).div(10000)
      );

      expect(ArtAfter).to.be.equal(
        ArtBefore.add(defaultNftPrice.mul(defaultArtistRoyalties).div(10000))
      );

      // Curator should receive defaultCuratorRoyalties (1.45%) of the transaction
      expect(CurAfter).to.be.equal(
        CurBefore.add(defaultNftPrice.mul(defaultCuratorRoyalties).div(10000))
      );

      // Seller should receive the remaining part : 100% - 2% - 2.2% of the transaction
      const sellerRoyalties =
        10000 -
        defaultMarketplaceRoyalties -
        defaultArtistRoyalties -
        defaultCuratorRoyalties;
      expect(SelAfter).to.be.equal(
        SelBefore.add(defaultNftPrice.mul(sellerRoyalties).div(10000))
      );

      // buyer should pay only NFT price + Gas fees
      expect(BuyAfter).to.be.equal(
        BuyBefore.sub(defaultNftPrice.add(gasSpent))
      );
    });
  });
});
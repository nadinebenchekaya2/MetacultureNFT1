const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const defaultListingFees = ethers.utils.parseUnits("0.1", "ether");
const defaultMarketplaceRoyalties = 200; // 2%

describe("MarketplaceConf", function () {
  async function marketplaceConfFixture() {
    // Contracts are deployed using the first signer/account by default
    const [User0Account, User1Account, User2Account, User3Account] =
      await ethers.getSigners();
    // Deploy the market config first
    const MarketplaceCfg = await ethers.getContractFactory("MarketplaceConf");
    const marketplaceCfg = await MarketplaceCfg.deploy(
      defaultListingFees,
      defaultMarketplaceRoyalties
    );
    return {
      marketplaceCfg,
      User0Account,
      User1Account,
      User2Account,
      User3Account,
    };
  }

  describe("Initial state", function () {
    it("Constructor", async function () {
      const MarketplaceCfg1 = await ethers.getContractFactory(
        "MarketplaceConf"
      );

      await expect(
        MarketplaceCfg1.deploy(defaultListingFees, 15000)
      ).to.be.revertedWith("Royalties percentage cannot be greater than 100%");
    });

    it("Check that marketplace conf owner is account 0", async function () {
      const { marketplaceCfg, User0Account } = await loadFixture(
        marketplaceConfFixture
      );
      expect(await marketplaceCfg.getOwner()).to.equal(User0Account.address);
    });

    it("Check listingFees default value is defaultListingFees ", async function () {
      const { marketplaceCfg } = await loadFixture(marketplaceConfFixture);
      expect(await marketplaceCfg.getListingFees()).to.equal(
        defaultListingFees
      );
    });

    it("Check getMarketplaceRoyalties default value is defaultMarketplaceRoyalties ", async function () {
      const { marketplaceCfg } = await loadFixture(marketplaceConfFixture);
      expect(await marketplaceCfg.getMarketplaceRoyalties()).to.equal(
        defaultMarketplaceRoyalties
      );
    });
  });

  describe("setListingFees", function () {
    it("Check when setListingFees is not called by the owner, the transaction is reverted with message", async function () {
      const { marketplaceCfg, User1Account } = await loadFixture(
        marketplaceConfFixture
      );
      await expect(
        marketplaceCfg.connect(User1Account).setListingFees(100)
      ).to.be.revertedWith(
        "Only the Marketplace owner is allowed to perform this action"
      );
    });

    it("Check when setListingFees is called by the owner, the listing fees value is updated", async function () {
      const { marketplaceCfg } = await loadFixture(marketplaceConfFixture);
      await marketplaceCfg.setListingFees(100);

      expect(await marketplaceCfg.getListingFees()).to.be.equal(100);
    });
  });

  describe("setMarketplaceRoyalties", function () {
    it("Check when setMarketplaceRoyalties is not called by the owner, the transaction is reverted with message", async function () {
      const { marketplaceCfg, User1Account } = await loadFixture(
        marketplaceConfFixture
      );
      await expect(
        marketplaceCfg.connect(User1Account).setMarketplaceRoyalties(100)
      ).to.be.revertedWith(
        "Only the Marketplace owner is allowed to perform this action"
      );
    });

    it("Check when getMarketplaceRoyalties is called by the owner, the listing fees value is updated", async function () {
      const { marketplaceCfg } = await loadFixture(marketplaceConfFixture);
      await marketplaceCfg.setMarketplaceRoyalties(100);

      expect(await marketplaceCfg.getMarketplaceRoyalties()).to.be.equal(100);
    });

    it("Check when getMarketplaceRoyalties is called with a value greater than 100% , the transaction is reverted with a message", async function () {
      const { marketplaceCfg } = await loadFixture(marketplaceConfFixture);

      await expect(
        marketplaceCfg.setMarketplaceRoyalties(10001)
      ).to.be.revertedWith("Royalties percentage cannot be greater than 100%");
    });
  });

  describe("setArtistRoyalties", function () {
    it("Check when setArtistRoyalties is not called by the owner, the transaction is reverted with message", async function () {
      const { marketplaceCfg, User1Account } = await loadFixture(
        marketplaceConfFixture
      );
      await expect(
        marketplaceCfg
          .connect(User1Account)
          .setArtistRoyalties(
            "0xe1991dca3c754cc04c6e3cbc6a3bc8fc2dd115ee",
            1,
            100
          )
      ).to.be.revertedWith(
        "Only the Marketplace owner is allowed to perform this action"
      );
    });

    it("Check when setArtistRoyalties is called by the owner, the Artist Royalties value is updated", async function () {
      const { marketplaceCfg } = await loadFixture(marketplaceConfFixture);
      await marketplaceCfg.setArtistRoyalties(
        "0xe1991dca3c754cc04c6e3cbc6a3bc8fc2dd115ee",
        1,
        100
      );

      expect(
        await marketplaceCfg.getArtistRoyalties(
          "0xe1991dca3c754cc04c6e3cbc6a3bc8fc2dd115ee",
          1
        )
      ).to.be.equal(100);
    });

    it("Check when setArtistRoyalties is called with a value greater than 100% , the transaction is reverted with a message", async function () {
      const { marketplaceCfg } = await loadFixture(marketplaceConfFixture);
      await expect(
        marketplaceCfg.setArtistRoyalties(
          "0xe1991dca3c754cc04c6e3cbc6a3bc8fc2dd115ee",
          1,
          10001
        )
      ).to.be.revertedWith("Royalties percentage cannot be greater than 100%");
    });
  });

  describe("setCuratorRoyalties", function () {
    it("Check when setCuratorRoyalties is not called by the owner, the transaction is reverted with message", async function () {
      const { marketplaceCfg, User1Account } = await loadFixture(
        marketplaceConfFixture
      );
      await expect(
        marketplaceCfg
          .connect(User1Account)
          .setCuratorRoyalties(
            "0xe1991dca3c754cc04c6e3cbc6a3bc8fc2dd115ee",
            User1Account.address,
            100
          )
      ).to.be.revertedWith(
        "Only the Marketplace owner is allowed to perform this action"
      );
    });

    it("Check when setCuratorRoyalties is called by the owner, the Curator Royalties value is updated", async function () {
      const { marketplaceCfg, User1Account } = await loadFixture(
        marketplaceConfFixture
      );
      await marketplaceCfg.setCuratorRoyalties(
        "0xe1991dca3c754cc04c6e3cbc6a3bc8fc2dd115ee",
        User1Account.address,
        100
      );

      const result = await marketplaceCfg.getCuratorRoyalties(
        "0xe1991dca3c754cc04c6e3cbc6a3bc8fc2dd115ee"
      );

      expect(result[0]).to.be.equal(User1Account.address);
      expect(result[1]).to.be.equal(100);
    });

    it("Check when setCuratorRoyalties is called with a value greater than 100% , the transaction is reverted with a message", async function () {
      const { marketplaceCfg, User1Account } = await loadFixture(
        marketplaceConfFixture
      );
      await expect(
        marketplaceCfg.setCuratorRoyalties(
          "0xe1991dca3c754cc04c6e3cbc6a3bc8fc2dd115ee",
          User1Account.address,
          10001
        )
      ).to.be.revertedWith("Royalties percentage cannot be greater than 100%");
    });
  });

  describe("getAllShares", function () {
    it("Check when getAllShares is not called by the owner, the transaction is reverted with message", async function () {
      const { marketplaceCfg, User1Account } = await loadFixture(
        marketplaceConfFixture
      );
      await expect(
        marketplaceCfg
          .connect(User1Account)
          .getAllShares("0xe1991dca3c754cc04c6e3cbc6a3bc8fc2dd115ee", 1, 1000)
      ).to.be.revertedWith(
        "Only the Marketplace owner is allowed to perform this action"
      );
    });

    it("Check when getAllShares is called by the owner and the sum of royalties is > 100 %  the transaction is reverted with message", async function () {
      const { marketplaceCfg, User0Account, User1Account } = await loadFixture(
        marketplaceConfFixture
      );
      await marketplaceCfg.setMarketplaceRoyalties(4000);
      await marketplaceCfg.setArtistRoyalties(
        "0xe1991dca3c754cc04c6e3cbc6a3bc8fc2dd115ee",
        1,
        4000
      );
      await marketplaceCfg.setCuratorRoyalties(
        "0xe1991dca3c754cc04c6e3cbc6a3bc8fc2dd115ee",
        User1Account.address,
        4000
      );
      await expect(
        marketplaceCfg.getAllShares(
          "0xe1991dca3c754cc04c6e3cbc6a3bc8fc2dd115ee",
          1,
          1000
        )
      ).to.be.revertedWith("Sum of all royalties cannot be greater than 100%");
    });

    it("Check when getAllShares is called by the owner and the sum of royalties is < 100 %  the share are correctly calculated", async function () {
      const { marketplaceCfg, User0Account, User1Account } = await loadFixture(
        marketplaceConfFixture
      );
      const tstMarket = 100; // 1%
      const tstArtist = 200; // 1%
      const tstCurator = 300; // 2%
      const tstPrice = 1000;
      await marketplaceCfg.setMarketplaceRoyalties(tstMarket);
      await marketplaceCfg.setArtistRoyalties(
        "0xe1991dca3c754cc04c6e3cbc6a3bc8fc2dd115ee",
        1,
        tstArtist
      );
      await marketplaceCfg.setCuratorRoyalties(
        "0xe1991dca3c754cc04c6e3cbc6a3bc8fc2dd115ee",
        User1Account.address,
        tstCurator
      );
      result = await marketplaceCfg.getAllShares(
        "0xe1991dca3c754cc04c6e3cbc6a3bc8fc2dd115ee",
        1,
        tstPrice
      );
      expect(result["markeplaceShare"]).equal((tstPrice * tstMarket) / 10000);
      expect(result["artistShare"]).equal((tstPrice * tstArtist) / 10000);
      expect(result["curatorShare"]).equal((tstPrice * tstCurator) / 10000);
      expect(result["sellerShare"]).equal(
        (tstPrice * (10000 - tstMarket - tstArtist - tstCurator)) / 10000
      );
    });
  });

  describe("setMarketplaceAdr", function () {
    it("Check that when setMarketplaceAdr is not called by contract onwer, the transaction is reverted with message", async function () {
      const { marketplaceCfg, User1Account } = await loadFixture(
        marketplaceConfFixture
      );
      await expect(
        marketplaceCfg
          .connect(User1Account)
          .setMarketplaceAdr("0xe1991dca3c754cc04c6e3cbc6a3bc8fc2dd115ee")
      ).to.be.revertedWith(
        "Only the Marketplace owner is allowed to perform this action"
      );
    });

    it("Check that when setMarketplaceAdr is  called by contract onwer, the transaction is not reverted", async function () {
      const { marketplaceCfg, User0Account, User1Account } = await loadFixture(
        marketplaceConfFixture
      );
      await expect(
        marketplaceCfg
          .connect(User0Account)
          .setMarketplaceAdr(User1Account.address)
      ).not.to.be.reverted;
    });

    it("Check that when setMarketplaceAdr is called by contract onwer, the smart contract address is correctly set", async function () {
      const { marketplaceCfg, User1Account } = await loadFixture(
        marketplaceConfFixture
      );
      await marketplaceCfg.setMarketplaceAdr(User1Account.address);
      expect(await marketplaceCfg.getMarketplaceAdr()).to.equal(
        User1Account.address
      );
    });
  });

  describe("getMarketplaceAdr", function () {
    it("Check that when getMarketplaceAdr is not called by contract onwer, the transaction is reverted with message", async function () {
      const { marketplaceCfg, User1Account } = await loadFixture(
        marketplaceConfFixture
      );
      await expect(
        marketplaceCfg.connect(User1Account).getMarketplaceAdr()
      ).to.be.revertedWith(
        "Only the Marketplace owner is allowed to perform this action"
      );
    });
  });
});
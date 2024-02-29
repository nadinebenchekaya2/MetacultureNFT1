const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { string } = require("hardhat/internal/core/params/argumentTypes");
const defaultListingFees = ethers.utils.parseUnits("0.1", "ether");
const defaultNftPrice = ethers.utils.parseUnits("1", "ether");
const defaultMarketplaceRoyalties = 200; // 2%

describe("Marketplace", function () {
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

  describe("Initial state", function () {
    it("Marketplace owner correctly set", async function () {
      const { marketplace, marketplaceCfg, User0Account } = await loadFixture(
        marketplaceFixture
      );
      expect(await marketplace.getOwner()).to.equal(User0Account.address);
    });
  });

  describe("createCollection", function () {
    it("if collectionName is empty the transaction will be reverted with message", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
      } = await loadFixture(marketplaceFixture);
      await expect(
        marketplace.connect(User1Account).createCollection("", "MySymbol()")
      ).to.be.revertedWith("The collection name should not be an empty string");
    });

    it("if _collectionName is not empty the transaction will not be reverted", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
      } = await loadFixture(marketplaceFixture);
      await expect(
        marketplace
          .connect(User1Account)
          .createCollection("MyCollection", "MySymbol()")
      ).not.to.reverted;
    });

    it("if _collectionName is not empty a collection will created and event CollectionAdded will be emited ", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
      } = await loadFixture(marketplaceFixture);
      const tx1 = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rc1 = await tx1.wait();
      const tsteventName = rc1.events[0]["event"];
      expect(tsteventName).equal("CollectionAdded");
      collectionAdr = rc1.events[0].args["collectionAdr"];
    });
  });

  describe("createNft", function () {
    it("if _nftUri is empty the transaction will be reverted with message", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
      } = await loadFixture(marketplaceFixture);
      const collectionAdr = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rc1 = await collectionAdr.wait();
      //console.log("rc1", rc1.logs);
      const tstcollectionAdr = rc1.events[0].args["collectionAdr"];

      await expect(
        marketplace
          .connect(User1Account)
          .createNft(true, 200, tstcollectionAdr, 123123, "")
      ).to.be.revertedWith("The NFT uri should not be empty");
    });

    it("if listing fees are not provided the transaction will be reverted with message", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
      } = await loadFixture(marketplaceFixture);
      const collectionAdr = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rc1 = await collectionAdr.wait();
      //console.log("rc1", rc1.logs);
      const tstcollectionAdr = rc1.events[0].args["collectionAdr"];

      await expect(
        marketplace
          .connect(User1Account)
          .createNft(true, 200, tstcollectionAdr, 123123, "www.google.com")
      ).to.be.revertedWith("listing fees are missing");
    });

    it("if artist royalties are > 100% the transaction will be reverted with message", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
      } = await loadFixture(marketplaceFixture);
      const collectionAdr = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rc1 = await collectionAdr.wait();
      //console.log("rc1", rc1.logs);
      const tstcollectionAdr = rc1.events[0].args["collectionAdr"];

      await expect(
        marketplace
          .connect(User1Account)
          .createNft(true, 10001, tstcollectionAdr, 123123, "www.google.com", {
            value: defaultListingFees,
          })
      ).to.be.revertedWith("Royalties percentage cannot be greater than 100%");
    });

    it("if the nft is for sale and the price is 0 the transaction will be reverted with message", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
      } = await loadFixture(marketplaceFixture);
      const collectionAdr = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rc1 = await collectionAdr.wait();
      //console.log("rc1", rc1.logs);
      const tstcollectionAdr = rc1.events[0].args["collectionAdr"];

      await expect(
        marketplace.createNft(true, 200, tstcollectionAdr, 0, "www.goole.com", {
          value: defaultListingFees,
        })
      ).to.be.revertedWith("The sale price must be greater than 0");
    });

    it("if the nft is not for sale and the price is 0 then the transaction will not be reverted", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
      } = await loadFixture(marketplaceFixture);
      const collectionAdr = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rc1 = await collectionAdr.wait();
      //console.log("rc1", rc1.logs);
      const tstcollectionAdr = rc1.events[0].args["collectionAdr"];

      await expect(
        marketplace
          .connect(User1Account)
          .createNft(false, 200, tstcollectionAdr, 0, "www.goole.com", {
            value: defaultListingFees,
          })
      ).not.be.reverted;
    });

    it("if the collection address is wrong the transaction will be reverted with message", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
      } = await loadFixture(marketplaceFixture);
      const collectionAdr = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rc1 = await collectionAdr.wait();
      //console.log("rc1", rc1.logs);
      const tstcollectionAdr = "0x957018A0893707b83c4b0F4FEE8Df84FD677169F";

      await expect(
        marketplace.createNft(true, 200, tstcollectionAdr, 0, "www.goole.com", {
          value: defaultListingFees,
        })
      ).to.be.revertedWith("Collection does not exist");
    });

    it("check that is parameters are ok, and event NftAdded is triggered with the following params : Collection Adr, Nft ID, Creator, Price", async function () {
      const { marketplace, User1Account, User2Account } = await loadFixture(
        marketplaceFixture
      );
      const collectionAdr = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rc1 = await collectionAdr.wait();
      const tstcollectionAdr = rc1.events[0].args["collectionAdr"];
      const tx = await marketplace
        .connect(User1Account)
        .createNft(true, 200, tstcollectionAdr, 9999, "www.goole.com", {
          value: defaultListingFees,
        });
      const rc2 = await tx.wait();
      tstNftId = rc2.events[2].args["nftId"].toNumber();
      expect(tstNftId).equal(1);
    });
  });

  describe("sellNft", function () {
    it("if _price = 0 the transaction will be reverted with message", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
      } = await loadFixture(marketplaceFixture);
      const collectionAdr = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rc1 = await collectionAdr.wait();
      const tstcollectionAdr = rc1.events[0].args["collectionAdr"];
      const tx = await marketplace
        .connect(User1Account)
        .createNft(true, 200, tstcollectionAdr, 9999, "www.goole.com", {
          value: defaultListingFees,
        });
      const rc2 = await tx.wait();
      // sell the nft
      await expect(
        marketplace.connect(User1Account).sellNft(tstcollectionAdr, 1, 0)
      ).to.be.revertedWith("The sale price must be greater than 0");
    });

    it("if collection does not exists the transaction will be reverted with message", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
      } = await loadFixture(marketplaceFixture);
      const collectionAdr = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rc1 = await collectionAdr.wait();
      const tstcollectionAdr = rc1.events[0].args["collectionAdr"];
      const tx = await marketplace
        .connect(User1Account)
        .createNft(false, 200, tstcollectionAdr, 9999, "www.goole.com", {
          value: defaultListingFees,
        });
      const rc2 = await tx.wait();
      // sell the nft
      await expect(
        marketplace
          .connect(User1Account)
          .sellNft("0x203F460f51304D165e539d9eF33ce8A05D307D63", 1, 123456)
      ).to.be.revertedWith("Collection does not exist");
    });

    it("if _price ! 0 an event is emitted with _collectionAdr, _nftId, msg.sender, _price", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
      } = await loadFixture(marketplaceFixture);
      const collectionAdr = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rc1 = await collectionAdr.wait();
      const tstcollectionAdr = rc1.events[0].args["collectionAdr"];
      const tx = await marketplace
        .connect(User1Account)
        .createNft(false, 200, tstcollectionAdr, 9999, "www.goole.com", {
          value: defaultListingFees,
        });
      const rc2 = await tx.wait();
      // sell the nft
      const tx3 = await marketplace
        .connect(User1Account)
        .sellNft(tstcollectionAdr, 1, 99999);
      const rc3 = await tx3.wait();
      expect(rc3.events[1].args["collectionAdr"]).to.be.equal(tstcollectionAdr);
      expect(rc3.events[1].args["nftId"]).to.be.equal(1);
    });
  });

  describe("cancelSell", function () {
    it("if collection does not exists the transaction will be reverted with message", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
      } = await loadFixture(marketplaceFixture);
      const collectionAdr = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rc1 = await collectionAdr.wait();
      const tstcollectionAdr = rc1.events[0].args["collectionAdr"];
      const tx = await marketplace
        .connect(User1Account)
        .createNft(true, 200, tstcollectionAdr, 9999, "www.goole.com", {
          value: defaultListingFees,
        });
      const rc2 = await tx.wait();
      // sell the nft
      await expect(
        marketplace
          .connect(User1Account)
          .cancelSaleNft("0x203F460f51304D165e539d9eF33ce8A05D307D63", 1)
      ).to.be.revertedWith("Collection does not exist");
    });

    it("if collection  exists an event will be emitted with _collectionAdr, _nftId, msg.sender", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
      } = await loadFixture(marketplaceFixture);
      const collectionAdr = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rc1 = await collectionAdr.wait();
      const tstcollectionAdr = rc1.events[0].args["collectionAdr"];
      const tx = await marketplace
        .connect(User1Account)
        .createNft(true, 200, tstcollectionAdr, 9999, "www.goole.com", {
          value: defaultListingFees,
        });
      const rc2 = await tx.wait();
      // Cancel sell the nft
      const tx3 = await marketplace
        .connect(User1Account)
        .cancelSaleNft(tstcollectionAdr, 1);
      const rc3 = await tx3.wait();
      expect(rc3.events[1].args["collectionAdr"]).to.be.equal(tstcollectionAdr);
      expect(rc3.events[1].args["nftId"]).to.be.equal(1);
    });
  });

  describe("Buy", function () {
    it("if msg.value != price, the transaction will be reverted", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
      } = await loadFixture(marketplaceFixture);
      const collectionAdr = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rc1 = await collectionAdr.wait();
      const tstcollectionAdr = rc1.events[0].args["collectionAdr"];
      const tx = await marketplace
        .connect(User1Account)
        .createNft(true, 200, tstcollectionAdr, 9999, "www.goole.com", {
          value: defaultListingFees,
        });
      await expect(
        marketplace
          .connect(User2Account)
          .buyNft(tstcollectionAdr, 1, 9999, { value: 99 })
      ).to.be.revertedWith(
        "To complete the purchase please provide the correct price"
      );
    });

    it("if collection does not exists the transaction will be reverted with message", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
      } = await loadFixture(marketplaceFixture);
      const collectionAdr = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rc1 = await collectionAdr.wait();
      const tstcollectionAdr = rc1.events[0].args["collectionAdr"];
      const tx = await marketplace
        .connect(User1Account)
        .createNft(true, 200, tstcollectionAdr, 9999, "www.goole.com", {
          value: defaultListingFees,
        });
      await expect(
        marketplace
          .connect(User2Account)
          .buyNft("0xb5d492400d308c8f7a2a5651f68da4c631da3fab", 1, 9999, {
            value: 99,
          })
      ).to.be.revertedWith("Collection does not exist");
    });

    it("if collection exists an event will emitted with params _collectionAdr, _nftId, msg.sender, _price", async function () {
      const {
        marketplace,
        marketplaceCfg,
        User0Account,
        User1Account,
        User2Account,
      } = await loadFixture(marketplaceFixture);
      const tx1 = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rc1 = await tx1.wait();
      const tstcollectionAdr = rc1.events[0].args["collectionAdr"];
      const tx2 = await marketplace
        .connect(User1Account)
        .createNft(true, 200, tstcollectionAdr, 9999, "www.goole.com", {
          value: defaultListingFees,
        });
      const rc2 = await tx2.wait();
      const tx3 = await marketplace
        .connect(User2Account)
        .buyNft(tstcollectionAdr, 1, 9999, {
          value: 9999,
        });
      const rc3 = await tx3.wait();
      expect(rc3.events[1].args["collectionAdr"]).to.be.equal(tstcollectionAdr);
      expect(rc3.events[1].args["nftId"]).to.be.equal(1);
    });
  });

  describe("totalSupply", function () {
    it("Create a collection with 2 NFT not in sale and check that totalSupply() is incremented each time and nft is created", async function () {
      const { marketplace, User1Account, User2Account } = await loadFixture(
        marketplaceFixture
      );
      const collectionAdr = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");

      const rc1 = await collectionAdr.wait();
      const tstcollectionAdr = rc1.events[0].args["collectionAdr"];
      // check that total supply before the first nft creation is 0
      expect(await marketplace.totalSupply(tstcollectionAdr)).to.equal(0);
      // create first NFT
      await marketplace
        .connect(User1Account)
        .createNft(false, 200, tstcollectionAdr, 9999, "www.goole.com", {
          value: defaultListingFees,
        });
      // check that total supply after first nft creation is 1
      expect(await marketplace.totalSupply(tstcollectionAdr)).to.equal(1);
      // create second NFT
      await marketplace
        .connect(User1Account)
        .createNft(false, 200, tstcollectionAdr, 9999, "www.openia.com", {
          value: defaultListingFees,
        });
      // check that total supply after first nft creation is 1
      expect(await marketplace.totalSupply(tstcollectionAdr)).to.equal(2);
    });

    it("Create a collection with 2 NFT in sale and check that totalSupply() is incremented each time and nft is created", async function () {
      const { marketplace, User1Account, User2Account } = await loadFixture(
        marketplaceFixture
      );
      const collectionAdr = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");

      const rc1 = await collectionAdr.wait();
      const tstcollectionAdr = rc1.events[0].args["collectionAdr"];
      // check that total supply before the first nft creation is 0
      expect(await marketplace.totalSupply(tstcollectionAdr)).to.equal(0);
      // create first NFT
      await marketplace
        .connect(User1Account)
        .createNft(true, 200, tstcollectionAdr, 9999, "www.goole.com", {
          value: defaultListingFees,
        });
      // check that total supply after first nft creation is 1
      expect(await marketplace.totalSupply(tstcollectionAdr)).to.equal(1);
      // create second NFT
      await marketplace
        .connect(User1Account)
        .createNft(true, 200, tstcollectionAdr, 9999, "www.openia.com", {
          value: defaultListingFees,
        });
      // check that total supply after first nft creation is 1
      expect(await marketplace.totalSupply(tstcollectionAdr)).to.equal(2);
    });
  });

  describe("totalInSell", function () {
    it("Create a collection with 2 NFT in sale and check that totalSupply() is incremented each time and nft is create", async function () {
      const { marketplace, User1Account, User2Account } = await loadFixture(
        marketplaceFixture
      );
      const collectionAdr = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");

      const rc1 = await collectionAdr.wait();
      const tstcollectionAdr = rc1.events[0].args["collectionAdr"];
      // check that total supply before the first nft creation is 0
      expect(await marketplace.totalInSell(tstcollectionAdr)).to.equal(0);
      // create first NFT
      await marketplace
        .connect(User1Account)
        .createNft(true, 200, tstcollectionAdr, 9999, "www.goole.com", {
          value: defaultListingFees,
        });
      // check that total supply after first nft creation is 1
      expect(await marketplace.totalInSell(tstcollectionAdr)).to.equal(1);
      // create second NFT
      await marketplace
        .connect(User1Account)
        .createNft(true, 200, tstcollectionAdr, 9999, "www.openia.com", {
          value: defaultListingFees,
        });
      // check that total supply after first nft creation is 1
      expect(await marketplace.totalInSell(tstcollectionAdr)).to.equal(2);
    });
  });

  describe("getNftOwner", function () {
    it("if the collection address does not exist, the transaction will be reverted with message ", async function () {
      const { marketplace, User2Account, User4Account } = await loadFixture(
        marketplaceFixture
      );
      const collection1Adr = await marketplace.createCollection(
        "MyCollectionUser1",
        "MySymbol()"
      );

      const rc1 = await collection1Adr.wait();
      const tstcollection1Adr = rc1.events[0].args["collectionAdr"];
      // create first NFT
      await marketplace.createNft(
        false,
        200,
        tstcollection1Adr,
        9999,
        "www.goole.com",
        {
          value: defaultListingFees,
        }
      );
      // check both nfts are owned by user2
      await expect(
        marketplace.getNftOwner("0x6DfE1F773952760c1467D0cdb0f69C41ab932e6f", 1)
      ).to.be.revertedWith("Collection does not exist");
    });
    /*
    it("if the collection address exist but the nftid does not exist, the transaction will be reverted with message ", async function () {
      const { marketplace, User2Account, User4Account } = await loadFixture(
        marketplaceFixture
      );
      const collection1Adr = await marketplace.createCollection(
        "MyCollectionUser1",
        "MySymbol()"
      );

      const rc1 = await collection1Adr.wait();
      const tstcollection1Adr = rc1.events[0].args["collectionAdr"];
      // create first NFT
      await marketplace.createNft(
        false,
        200,
        tstcollection1Adr,
        9999,
        "www.goole.com",
        {
          value: defaultListingFees,
        }
      );
      // check both nfts are owned by user2
      await expect(
        marketplace.getNftOwner(collection1Adr, 99)
      ).to.be.reverted;
    });*/

    it("Create two collections with 2 NFT each by user 2 and user 4, check that nft owner are correct ", async function () {
      const { marketplace, User2Account, User4Account } = await loadFixture(
        marketplaceFixture
      );
      const collection1Adr = await marketplace
        .connect(User2Account)
        .createCollection("MyCollectionUser2", "MySymbol()");

      const rc1 = await collection1Adr.wait();
      const tstcollection1Adr = rc1.events[0].args["collectionAdr"];
      // create first NFT
      await marketplace
        .connect(User2Account)
        .createNft(false, 200, tstcollection1Adr, 9999, "www.goole.com", {
          value: defaultListingFees,
        });
      // create second NFT
      await marketplace
        .connect(User2Account)
        .createNft(false, 200, tstcollection1Adr, 9999, "www.openia.com", {
          value: defaultListingFees,
        });
      // check both nfts are owned by user2
      expect(await marketplace.getNftOwner(tstcollection1Adr, 1)).to.equal(
        User2Account.address
      );
      expect(await marketplace.getNftOwner(tstcollection1Adr, 2)).to.equal(
        User2Account.address
      );
      const collection2Adr = await marketplace
        .connect(User4Account)
        .createCollection("MyCollectionUser2", "MySymbol()");

      const rc2 = await collection2Adr.wait();
      const tstcollection2Adr = rc2.events[0].args["collectionAdr"];
      // create first NFT
      await marketplace
        .connect(User4Account)
        .createNft(false, 200, tstcollection2Adr, 9999, "www.maaf.com", {
          value: defaultListingFees,
        });
      // create second NFT
      await marketplace
        .connect(User4Account)
        .createNft(false, 200, tstcollection2Adr, 9999, "www.microsoft.com", {
          value: defaultListingFees,
        });
      // check both nfts are owned by user2
      expect(await marketplace.getNftOwner(tstcollection2Adr, 1)).to.equal(
        User4Account.address
      );
      expect(await marketplace.getNftOwner(tstcollection2Adr, 2)).to.equal(
        User4Account.address
      );
    });
  });

  describe("getCurrentListingFees", function () {
    it("check that listing fees are correctly set", async function () {
      const tstListingFees1 = ethers.utils.parseUnits("0.0001", "ether");
      const tstListingFees2 = ethers.utils.parseUnits("0.033", "ether");
      // set listing fees to 0.0001 and read it back
      const { marketplace, marketplaceCfg, User0Account } = await loadFixture(
        marketplaceFixture
      );

      await marketplaceCfg.setListingFees(tstListingFees1);
      tstlistingFees = await marketplace.getCurrentListingFees();
      expect(tstlistingFees).to.equal(tstListingFees1);
      await marketplaceCfg.setListingFees(tstListingFees2);
      tstlistingFees = await marketplace.getCurrentListingFees();
      expect(tstlistingFees).to.equal(tstListingFees2);
    });
  });

  describe("Check that the nfd ids create are incremented by 1, no wrong number", function () {
    it("Create 1000 nft, check that id are correct", async function () {
      const { marketplace, User1Account, User2Account } = await loadFixture(
        marketplaceFixture
      );
      const collectionAdr = await marketplace
        .connect(User1Account)
        .createCollection("MyCollection", "MySymbol()");
      const rc1 = await collectionAdr.wait();
      const tstcollectionAdr = rc1.events[0].args["collectionAdr"];
      for (index = 0; index < 10; index++) {
        const nfturi = "duetodata_" + index;
        const tx = await marketplace
          .connect(User1Account)
          .createNft(true, 200, tstcollectionAdr, 9999, nfturi, {
            value: defaultListingFees,
          });
        const rc2 = await tx.wait();
        tstNftId = rc2.events[2].args["nftId"];
        expect(tstNftId).equal(index + 1);
      }
    }, 10000);
  });
});
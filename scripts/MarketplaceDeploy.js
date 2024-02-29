const hre = require("hardhat");
require("dotenv").config();
// ListingFees is set by default to 0.001 MATIC
const defaultListingFees = ethers.utils.parseUnits("0.0001", "ether");
// MarketPlace royalties is set by default to 2% ( 200 in basic point)
const defaultMarketplaceRoyalties = 200;

async function main() {
  // Deploy the smart contract
  const owner = await ethers.getSigner();

  // Deploy the market config first
  const MarketplaceCfg = await ethers.getContractFactory("MarketplaceConf");
  const marketplaceCfg = await MarketplaceCfg.deploy(
    defaultListingFees,
    defaultMarketplaceRoyalties
  );
  // Wait deploy to finish
  await marketplaceCfg.deployed();
  console.log(
    `marketplaceConf deployed to ${marketplaceCfg.address} with onwer address = ${owner.address}`
  );
  // Deploy the Marketplace
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(marketplaceCfg.address);
  // Wait deploy to finish
  await marketplace.deployed();
  // set Marketplace adr to Marketplace Config
  await marketplaceCfg.setMarketplaceAdr(marketplace.address);

  console.log(
    `marketplace deployed to ${marketplace.address} with onwer address = ${owner.address}`
  );
  //wait for 5 block transactions to ensure deployment before verifying
  console.log(`Waiting for > 5 confirmation before Contract verification`);
  await marketplace.deployTransaction.wait(7);
  // Verify the contract after deploying
  await hre.run("verify:verify", {
    address: marketplace.address,
    constructorArguments: [marketplaceCfg.address],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
const hre = require("hardhat");
const { ethers } = require("hardhat");
// defaultListingFees is set by default to 0.0001 MATIC
const defaultListingFees = ethers.utils.parseUnits("0.0001", "ether");
// defaultNftPrice is set by default to 0.001 MATIC
const defaultNftPrice = ethers.utils.parseUnits("0.001", "ether");
// defaultArtistRoyalties is set by default to 2.2%
const defaultArtistRoyalties = 220;
// load json file
const contractJson = require("../artifacts/contracts/Marketplace.sol/Marketplace.json");
// load ABI application binary interface
const abi = contractJson.abi;

async function main() {
  const alchemy = new hre.ethers.providers.AlchemyProvider(
    "maticmum",
    process.env.ALCHEMY_API_KEY
  );
  const userWallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, alchemy);
  const Marketplace = new hre.ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    abi,
    userWallet
  );
  owner = await Marketplace.getOwner();
  console.log(owner);
  const tx1 = await Marketplace.createCollection("Hamdi", "d2d");
  const rc = await tx1.wait();

  const collectionAdr = rc.events[0].args["collectionAdr"];
  console.log(`Collection Created @ ${collectionAdr}`);

  const nfturi = "www.google.com";
  let tx2 = await Marketplace.createNft(
    true,
    defaultArtistRoyalties,
    collectionAdr,
    defaultNftPrice,
    nfturi,
    { value: defaultListingFees }
  );
  let rc2 = await tx2.wait();

  let tx3 = await Marketplace.createNft(
    true,
    defaultArtistRoyalties,
    collectionAdr,
    defaultNftPrice,
    nfturi + 1,
    { value: defaultListingFees }
  );
  let rc3 = await tx3.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
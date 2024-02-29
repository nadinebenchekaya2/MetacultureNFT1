//0x60B1e9c17F79F1d97EDdC62580A1195574ac1371
const hre = require("hardhat");
// load json file
const contractJson = require("../artifacts/contracts/Marketplace.sol/Marketplace.json");
// lead ABI application binary interface
const abi = contractJson.abi;
require("dotenv").config({ path: ".env" });
const collectionsInfo = [
  { adr: '0xBD4BBECa5bF9e7a8237a1B1145f9dF8e103E8957', size: 2 },
  { adr: '0xEAA950ec8D1d86586Cfa593fAdC8b603109BCB38', size: 2 },
  { adr: '0xD62B4c51a1B82A96E8490f6ef794b31Fb2682f91', size: 2 },
  { adr: '0xF284d0A35217C3f25A51189b37776c50E03310e0', size: 2 },
  { adr: '0x9365eD57c54AC81FA46bdf5818915c132FB05925', size: 2 }
];
const alchemy = new hre.ethers.providers.AlchemyProvider(
  "matic",
  process.env.ALCHEMY_API_KEY_POLYGON
);
// defaultNftPrice is set by default to 0.001 MATIC
const defaultNftPrice = ethers.utils.parseUnits("0.00001", "ether");
const defaultNftPriceBuy = ethers.utils.parseUnits("0.001", "ether");



async function getUserParams(userPrivateKey) {
  const UserWallet = new hre.ethers.Wallet(userPrivateKey, alchemy);
  const Marketplace = new hre.ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    abi,
    UserWallet
  );
  return [Marketplace, UserWallet.address];
}

async function buyByUser(userPrivateKey, collectionAdr, ids) {
  [Marketplace, UserWalletAdr] = await getUserParams(userPrivateKey);
  // Estimate gas price and gas limit
  const gasPriceOracle = "https://gasstation-mainnet.matic.network";
  const gasPrice = await ethers.provider.getGasPrice(gasPriceOracle);
  for (index = 0; index < ids.length; index++) {
    const estimate1 = await Marketplace.estimateGas.buyNft(
      collectionAdr,
      ids[index],
      defaultNftPriceBuy,
      { value: defaultNftPriceBuy }
    );
    const tx = await Marketplace.buyNft(
      collectionAdr,
      ids[index],
      defaultNftPriceBuy,
      { value: defaultNftPriceBuy,
        gasPrice: gasPrice,
        gasLimit: estimate1.mul(2),}
    );
    const rc = await tx.wait();
  }
}
async function sellByUser(userPrivateKey, collectionAdr, ids) {
  [Marketplace, UserWalletAdr] = await getUserParams(userPrivateKey);
  // Estimate gas price and gas limit
  const gasPriceOracle = "https://gasstation-mainnet.matic.network";
  const gasPrice = await ethers.provider.getGasPrice(gasPriceOracle);
  for (index = 0; index < ids.length; index++) {
    const estimate2 = await Marketplace.estimateGas.sellNft(
      collectionAdr,
      ids[index],
      defaultNftPrice,
      { value: defaultNftPrice }
      );
    const tx = await Marketplace.sellNft(
      collectionAdr,
      ids[index],
      defaultNftPrice,
      { value: defaultNftPrice,
        gasPrice: gasPrice,
        gasLimit: estimate2.mul(2), }
    );
    const rc = await tx.wait();
  }
}
async function cancelSellByUser(userPrivateKey, collectionAdr, ids) {
  [Marketplace, UserWalletAdr] = await getUserParams(userPrivateKey);
  // Estimate gas price and gas limit
  const gasPriceOracle = "https://gasstation-mainnet.matic.network";
  const gasPrice = await ethers.provider.getGasPrice(gasPriceOracle);
  for (index = 0; index < ids.length; index++) {
    const estimate3 = await Marketplace.estimateGas.cancelSaleNft(
      collectionAdr, ids[index], 
      {value: defaultNftPrice,}
      );
    const tx = await Marketplace.cancelSaleNft(collectionAdr, ids[index], {
      value: defaultNftPrice,
      gasPrice: gasPrice,
      gasLimit: estimate3.mul(2),
    });
    const rc = await tx.wait();
  }
}

async function main() {
  User1WalletInfo = process.env.USR1_PRV_KEY;
  User2WalletInfo = process.env.USR2_PRV_KEY;

  console.log("Buy Sell 1/5");
  targetAdr = collectionsInfo[0]["adr"];
  await buyByUser(User1WalletInfo, targetAdr, [2]);
  await sellByUser(User1WalletInfo, targetAdr, [2]);
  await cancelSellByUser(User1WalletInfo, targetAdr, [2]);

  // await buyByUser(User2WalletInfo, targetAdr, [1]);
  // await sellByUser(User2WalletInfo, targetAdr, [1]);
  // await cancelSellByUser(User2WalletInfo, targetAdr, [1]);
  // console.log("Buy Sell 2/5");
  // targetAdr = collectionsInfo[1]["adr"];
  // await buyByUser(User1WalletInfo, targetAdr, [1]);
  // await sellByUser(User1WalletInfo, targetAdr, [1]);
  // await cancelSellByUser(User1WalletInfo, targetAdr, [1]);

  // await buyByUser(User2WalletInfo, targetAdr, [2]);
  // await sellByUser(User2WalletInfo, targetAdr, [2]);
  // await cancelSellByUser(User2WalletInfo, targetAdr, [2]);
  // console.log("Buy Sell 3/5");
  // targetAdr = collectionsInfo[2]["adr"];
  // await buyByUser(User1WalletInfo, targetAdr, [2]);
  // await sellByUser(User1WalletInfo, targetAdr, [2]);
  // await cancelSellByUser(User1WalletInfo, targetAdr, [2]);

  // await buyByUser(User2WalletInfo, targetAdr, [1]);
  // await sellByUser(User2WalletInfo, targetAdr, [1]);
  // await cancelSellByUser(User2WalletInfo, targetAdr, [1]);
  // console.log("Buy Sell 4/5");
  // targetAdr = collectionsInfo[3]["adr"];
  // await buyByUser(User1WalletInfo, targetAdr, [2]);
  // await sellByUser(User1WalletInfo, targetAdr, [2]);
  // await cancelSellByUser(User1WalletInfo, targetAdr, [2]);

  // await buyByUser(User2WalletInfo, targetAdr, [1]);
  // await sellByUser(User2WalletInfo, targetAdr, [1]);
  // await cancelSellByUser(User2WalletInfo, targetAdr, [1]);
  // console.log("Buy Sell 5/5");
  // targetAdr = collectionsInfo[4]["adr"];
  // await buyByUser(User1WalletInfo, targetAdr, [1]);
  // await sellByUser(User1WalletInfo, targetAdr, [1]);
  // await cancelSellByUser(User1WalletInfo, targetAdr, [1]);

  // await buyByUser(User2WalletInfo, targetAdr, [2]);
  // await sellByUser(User2WalletInfo, targetAdr, [2]);
  // await cancelSellByUser(User2WalletInfo, targetAdr, [2]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
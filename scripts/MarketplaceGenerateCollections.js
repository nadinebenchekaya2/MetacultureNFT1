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
const CollectionsInfo = [];
// Collection Names
collectioNames = ["FootBall Players", "Sneakers", "Galaxies", "Anime", "Cars"];
// Collection Symbols
collectioSymbols = ["FootP", "Sk", "Gax", "Ani", "Car"];
// 200 nft uris
nftUris = [
  [
    "https://api.npoint.io/3a76ba5be57918ab00c4",
    "https://api.npoint.io/b38a2e8b0342ff2b8947",
    "https://api.npoint.io/dfd3fee7548a166d2d1b",
    "https://api.npoint.io/3f610cad2b2b193c1b00",
    "https://api.npoint.io/0c74087c8569d2623443",
    "https://api.npoint.io/7b239cfcc6284c850161",
    "https://api.npoint.io/73da32015189c87ec8ea",
    "https://api.npoint.io/8dc8ec2211f1d2b2af1f",
    "https://api.npoint.io/9915e4eacd68b7cf6872",
    "https://api.npoint.io/8768f43d37133db70c02",
    "https://api.npoint.io/16e0b5b6957d7565bf2f",
    "https://api.npoint.io/0dc8d5e8317f619bfa7e",
    "https://api.npoint.io/b99e42b4d968195318b1",
    "https://api.npoint.io/bdc31c072501ffa187e3",
    "https://api.npoint.io/5fdbfb7fc8eb02572e4f",
    "https://api.npoint.io/9bd3ac651a035fcd3902",
    "https://api.npoint.io/005ecffee4474b53b3ea",
    "https://api.npoint.io/a8bb32433b30056c04f3",
    "https://api.npoint.io/64195730188d1de14130",
    "https://api.npoint.io/86078a2510a0ef54f351",
    "https://api.npoint.io/7b379202d85f95f62f27",
    "https://api.npoint.io/897ffad842d7576551bb",
    "https://api.npoint.io/285ac0072822dfd6b731",
    "https://api.npoint.io/9fa050fa742e2e4e79c1",
    "https://api.npoint.io/aa867e7fa4023900f0fa",
    "https://api.npoint.io/d1c43fd82b0cac175d96",
    "https://api.npoint.io/c63b7985a0c31951a5df",
    "https://api.npoint.io/826198f31ab159cb7d68",
    "https://api.npoint.io/62902a9624e39cc40887",
    "https://api.npoint.io/df1efe5213b80de2e211",
    "https://api.npoint.io/42b211d7f54c3e80b4ed",
    "https://api.npoint.io/6cace2612fd139b7d65c",
    "https://api.npoint.io/326044a6ce3cc688135d",
    "https://api.npoint.io/9d3b931199f9afd2e03c",
    "https://api.npoint.io/009e225836cdcda7087a",
    "https://api.npoint.io/b5d80b6469145416e4d8",
    "https://api.npoint.io/e2c6acdcd395ce1aae80",
    "https://api.npoint.io/cfb33134df5e04d2c18b",
    "https://api.npoint.io/99ba62aa8999e0ab9e7d",
    "https://api.npoint.io/ea73f40c66fbd9be1375",
    "https://api.npoint.io/d35e3c2dcba6111e37c3",
    "https://api.npoint.io/e47855dabba5e7081151",
    "https://api.npoint.io/ba0166948b97adab61d7",
    "https://api.npoint.io/5060d84fc54f83a16c8c",
    "https://api.npoint.io/f98072429d0e689d708f",
    "https://api.npoint.io/e1a0bdf9d3051ba5240d",
    "https://api.npoint.io/d51ccbbd2daf4330feb0",
    "https://api.npoint.io/c3aed19045a640c8617b",
    "https://api.npoint.io/9e49fa8c35a4b030a0a3",
    "https://api.npoint.io/92586315ca0f4992f0db]",
  ],
  [
    "https://api.npoint.io/5be1cb1a3ba417134ecf",
    "https://api.npoint.io/0d6e8d2deaf47867f9d7",
    "https://api.npoint.io/2f2a5c7c2623cf9c8974",
    "https://api.npoint.io/2d86e435b9f2d9ab2fa2",
    "https://api.npoint.io/87320db96d03c2e6f890",
    "https://api.npoint.io/0f1c94ead963d3be6319",
    "https://api.npoint.io/8659a2f2e25f791af8e4",
    "https://api.npoint.io/7515465eda4e46df2041",
    "https://api.npoint.io/b590aa6ed56a9c9640ee",
    "https://api.npoint.io/0f13f5607467fa61a720",
    "https://api.npoint.io/b1c9465740d7ae70d2cf",
    "https://api.npoint.io/7d8ed742fdc72d84b254",
    "https://api.npoint.io/22676b1a5e083be32bd1",
    "https://api.npoint.io/70c61e3cec9f2889bc0a",
    "https://api.npoint.io/200276662a2a019a6860",
    "https://api.npoint.io/4804912677f52c21f6cf",
    "https://api.npoint.io/ee6b04266c825f11d731",
    "https://api.npoint.io/33c8ebb7eba33dafbb1c",
    "https://api.npoint.io/2efea8b214da24e66cf8",
    "https://api.npoint.io/a40f864d75c358f2679d",
    "https://api.npoint.io/b5a16afea0f893259448",
    "https://api.npoint.io/ec3afee0d6ba6b7f4153",
    "https://api.npoint.io/cc9cff9bac4aa6c0b9c2",
    "https://api.npoint.io/e9b1dd5f9a1137729a44",
    "https://api.npoint.io/95de5f19b866bf360d44",
    "https://api.npoint.io/04a37eab37d2a21173e6",
    "https://api.npoint.io/3ddc1ecdbda674a1ac76",
    "https://api.npoint.io/32303ff010d01355ce26",
    "https://api.npoint.io/3830cbf463141a6bec92",
    "https://api.npoint.io/5e52a51d7ad053ce16a5",
    "https://api.npoint.io/1c06a34b6ea830e1442c",
    "https://api.npoint.io/a1f8a128698160fc1320",
    "https://api.npoint.io/88d86cfb6812849f0f99",
    "https://api.npoint.io/a541310a92dde18f3aa4",
    "https://api.npoint.io/a7f269fa35e589a08099",
    "https://api.npoint.io/5c222de8a19c92c35166",
    "https://api.npoint.io/650ce8f646a0c87fd971",
    "https://api.npoint.io/36301dcc705998bd8f7e",
    "https://api.npoint.io/2fea8672b029bd3e3467",
    "https://api.npoint.io/6c952c901f6005c9a00f",
    "https://api.npoint.io/20ea022c5dbff04f16f4",
    "https://api.npoint.io/0b73b24db1ea65ebff3a",
    "https://api.npoint.io/13939865c7d5399f83c0",
    "https://api.npoint.io/42f03a3d5368c1bea72f",
    "https://api.npoint.io/f0c74ea9ec191cab10e5",
    "https://api.npoint.io/385c2e258b497ec79a1e",
    "https://api.npoint.io/7765e7b23d675f30d00b",
    "https://api.npoint.io/e9e601d8c5a9bdf27852",
    "https://api.npoint.io/8e9e3c9a6bbd2ab94ec0",
    "https://api.npoint.io/f9394bc90da081d02c39",
  ],
  [
    "https://api.npoint.io/c80992185dc031e1de32",
    "https://api.npoint.io/1fbcf54d4b8131799fc8",
    "https://api.npoint.io/dd660722fd40bab07df5",
    "https://api.npoint.io/632f275082703c136b2c",
    "https://api.npoint.io/1fefb7556a04a2f5711a",
    "https://api.npoint.io/9ac463775bcb7d648cf8",
    "https://api.npoint.io/86c75c4e77509d3e6fbc",
    "https://api.npoint.io/9b201b326c472aaa5fd0",
    "https://api.npoint.io/19a84e0cf75578a87f5f",
    "https://api.npoint.io/3c9df7d724f87496b649",
    "https://api.npoint.io/f0faa2f63ca022ccaa99",
    "https://api.npoint.io/84f7b29c7bdf4030a6e8",
    "https://api.npoint.io/f1e3f1b0a2c81fbfacab",
    "https://api.npoint.io/f4ddbfdf633c0a72ffeb",
    "https://api.npoint.io/26f5584c2b2c5521a14e",
    "https://api.npoint.io/aca2aa2a01a2b86427ff",
    "https://api.npoint.io/8448f717876e3b809ef1",
    "https://api.npoint.io/8ad8fde3213eaf9b401b",
    "https://api.npoint.io/046955598e9e69dcd160",
    "https://api.npoint.io/6b30df72d3fc00c4b9f5",
    "https://api.npoint.io/03ca2cd8fa9dc5ebdc31",
    "https://api.npoint.io/dc5ee0c199098d991152",
    "https://api.npoint.io/aa9f7413ededd2557c9c",
    "https://api.npoint.io/277ef41c9afdffb082fb",
    "https://api.npoint.io/fe36f05aeeef7940131d",
    "https://api.npoint.io/8af2e097e0bac198d87d",
    "https://api.npoint.io/a5e1f9d00182c4a215e4",
    "https://api.npoint.io/a45d985330cf07677412",
    "https://api.npoint.io/d31b186173bac57a6c49",
    "https://api.npoint.io/ff708d2ee470c51dc7cb",
  ],
  [
    "https://api.npoint.io/cad74a7f0f1a9d46e5d9",
    "https://api.npoint.io/f5c82d9e46307837000e",
    "https://api.npoint.io/d53aac0c2371ad120a37",
    "https://api.npoint.io/b6af1ae6e603b52209d8",
    "https://api.npoint.io/5fe8aacd828fb94d9654",
    "https://api.npoint.io/8456a564a0ef219c36a0",
    "https://api.npoint.io/cf2b6aa6cd2ca9574ed5",
    "https://api.npoint.io/e4778581ec206b8e2639",
    "https://api.npoint.io/8d0cb2683302ed2d4bcf",
    "https://api.npoint.io/83191ce2be263cc7245f",
    "https://api.npoint.io/58b7bbe53e6b4603f17c",
    "https://api.npoint.io/cea2d85988fb0f2341c0",
    "https://api.npoint.io/cd6d4e14fb673013b2ec",
    "https://api.npoint.io/a9736f12622adef159d6",
    "https://api.npoint.io/99e34cb8db91c0d8a665",
    "https://api.npoint.io/8a3c3031ba59fc471d60",
    "https://api.npoint.io/3568de8cbffb8d47106c",
    "https://api.npoint.io/594f733c84c7fac164c3",
    "https://api.npoint.io/cee439263b2733eb335d",
    "https://api.npoint.io/b91c7fd299bb634f484e",
    "https://api.npoint.io/68bfc84137fde7356652",
    "https://api.npoint.io/594ef150977f44d2c902",
    "https://api.npoint.io/d69cd6fba208e6795c64",
    "https://api.npoint.io/d1ee0f428d8c84cb9d04",
    "https://api.npoint.io/e237e7e5b00708cab37b",
    "https://api.npoint.io/d1f41859b42a96ec267b",
    "https://api.npoint.io/24da231c474175b07773",
    "https://api.npoint.io/c50c0a3a53d40ae0b07b",
    "https://api.npoint.io/cdd4aeec300cb2a584cb",
    "https://api.npoint.io/249c839a898008f9d21d",
  ],
  [
    "https://api.npoint.io/02581369d9aee1d986a2",
    "https://api.npoint.io/f63682342655b4f1a737",
    "https://api.npoint.io/0cc20591b3d38525345a",
    "https://api.npoint.io/8317f02b6534ba631d56",
    "https://api.npoint.io/bfc29fbe011d90f4ab9a",
    "https://api.npoint.io/89bb46bcadc50628582c",
    "https://api.npoint.io/a05c656b5048702bdad0",
    "https://api.npoint.io/c07222e46a198441a21a",
    "https://api.npoint.io/b88011eccb6a59482f21",
    "https://api.npoint.io/df5cfbfdb413e6a3988e",
    "https://api.npoint.io/e1b6d795ab740feb3728",
    "https://api.npoint.io/0cca8ad7aec23889de8b",
    "https://api.npoint.io/f62aa924e4fc481cb9b3",
    "https://api.npoint.io/4613215b97e3b5a43154",
    "https://api.npoint.io/c12dbff11ca9a2afe7ba",
    "https://api.npoint.io/11e5d88f308580587f14",
    "https://api.npoint.io/44ddf2ac5e93622db5ee",
    "https://api.npoint.io/b2772fe1530263b2fc0b",
    "https://api.npoint.io/d175adbd13ec66cf04a9",
    "https://api.npoint.io/1e5fa41db6f03e8e6ada",
    "https://api.npoint.io/2e47c66610dba62db2ab",
    "https://api.npoint.io/1fa7c814fca1d3cd2b51",
    "https://api.npoint.io/9bd83187541397b85178",
    "https://api.npoint.io/8a2c9ad7235724f4d32d",
    "https://api.npoint.io/163ec158f80a3852658c",
    "https://api.npoint.io/f571ce6dc495db35fc5e",
    "https://api.npoint.io/663bc8b07e9fa8f5fdc0",
    "https://api.npoint.io/6a6456143b42f39c69e4",
    "https://api.npoint.io/9fc2457a7314554aa18a",
    "https://api.npoint.io/73118336a838efe3b23a",
    "https://api.npoint.io/a1636aeaa669c32427c6",
    "https://api.npoint.io/1ae450b137ecb69ce165",
    "https://api.npoint.io/a0ce65ed0bd5eab39c9e",
    "https://api.npoint.io/041f3946b2288745be21",
    "https://api.npoint.io/19a4bcc32abea60223e7",
    "https://api.npoint.io/591ef16c110099225f1e",
    "https://api.npoint.io/da2e8157ae9236189236",
    "https://api.npoint.io/b013d607796607779f17",
    "https://api.npoint.io/82b54c2ede9b1757f21b",
    "https://api.npoint.io/995284fc262bea36ff11",
  ],
];

async function main() {
  const alchemy = new hre.ethers.providers.AlchemyProvider(
    "matic",
    process.env.ALCHEMY_API_KEY_POLYGON,
    {
      name: 'polygon',
      chainId: 137
    }
  );
  const userWallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, alchemy);
  const Marketplace = new hre.ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    abi,
    userWallet
  );
  
  const gasPriceOracle = "https://gasstation-mainnet.matic.network";

  const gasPrice = await ethers.provider.getGasPrice(gasPriceOracle);
  
   owner = await Marketplace.getOwner();
   console.log(owner);

  // loop over all the collections (5 collections)
  for (
    collectionIndex = 0;
    collectionIndex < collectioNames.length;
    collectionIndex++
  ) {
    const estimate2 = await Marketplace.estimateGas.createCollection(
      collectioNames[collectionIndex],
      collectioSymbols[collectionIndex],
      );
    
    const tx1 = await Marketplace.createCollection(
      collectioNames[collectionIndex],
      collectioSymbols[collectionIndex],
      {gasPrice: gasPrice,
       gasLimit: estimate2.mul(2),}
    );
    const rc = await tx1.wait();
    const collectionAdr = rc.events[0].args["collectionAdr"];
    console.log(
      `Collection ${collectioNames[collectionIndex]} Created @ ${collectionAdr}`
    );

    //for (nftIndex = 0; nftIndex < nftUris[collectionIndex].length; nftIndex++) {
    for (nftIndex = 0; nftIndex < 2; nftIndex++) {
      const nfturi = nftUris[collectionIndex][nftIndex];
      const estimate3 = await Marketplace.estimateGas.createNft(
        true,
        defaultArtistRoyalties,
        collectionAdr,
        defaultNftPrice,
        nfturi,
        { value: defaultListingFees }
        );
      let tx2 = await Marketplace.createNft(
        true,
        defaultArtistRoyalties,
        collectionAdr,
        defaultNftPrice,
        nfturi,
        { value: defaultListingFees,
          gasPrice: gasPrice,
          gasLimit: estimate3.mul(2) }
      );
      const rc2 = await tx2.wait();
      console.log(`NFT Created ${nftIndex} , with uri: ${nfturi}`);
    }
    console.log(
      `Collection ${collectioNames[collectionIndex]} Size @ ${nftUris[collectionIndex].length}`
    );
    CollectionsInfo.push({
      adr: collectionAdr,
      size: 2, //nftUris[collectionIndex].length,
    });
  }
  console.log(CollectionsInfo);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
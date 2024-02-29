const fs = require("fs");
const collections = [
  { adr: '0xBD4BBECa5bF9e7a8237a1B1145f9dF8e103E8957', size: 2 },
  { adr: '0xEAA950ec8D1d86586Cfa593fAdC8b603109BCB38', size: 2 },
  { adr: '0xD62B4c51a1B82A96E8490f6ef794b31Fb2682f91', size: 2 },
  { adr: '0xF284d0A35217C3f25A51189b37776c50E03310e0', size: 2 },
  { adr: '0x9365eD57c54AC81FA46bdf5818915c132FB05925', size: 2 }
];
const jsoncontent = JSON.stringify(collections);
console.log(jsoncontent);
fs.writeFile("collections.json", JSON.stringify(collections), (err) => {
  if (err) throw err;
  console.log("Collections saved to collections.json");
});
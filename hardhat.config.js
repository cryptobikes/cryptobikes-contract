// hardhat.config.js
require("@nomiclabs/hardhat-ethers");

const { alchemyApiKey, mnemonic } = require("./secrets.json");

module.exports = {
  networks: {
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${alchemyApiKey}`,
      accounts: { mnemonic: mnemonic },
    },
  },
  solidity: "0.8.4",
};

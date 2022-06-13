const networkConfig = {
  default: {
    name: "hardhat",
    keepersUpdateInterval: "604800", // 7days in seconds
  },
  31337: {
    name: "localhost",
    subscriptionId: "588",
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
    keepersUpdateInterval: "604800", // 7days in seconds
    raffleEntranceFee: "100000000000000000", // 0.1 ETH
    callbackGasLimit: "500000", // 500,000 gas
  },
  4: {
    name: "rinkeby",
    subscriptionId: "6256",
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
    keepersUpdateInterval: "604800", // 7days in seconds
    raffleEntranceFee: "100000000000000000", // 0.1 ETH
    callbackGasLimit: "500000", // 500,000 gas
    vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
  },
  1: {
    name: "mainnet",
    keepersUpdateInterval: "604800", // 7days in seconds
  },
};

const developmentChains = ["hardhat", "localhost"];
const VERIFICATION_BLOCK_CONFIRMATIONS = 6;
const frontEndContractsFile = "../constants/contractAddresses.json";
const frontEndAbiFile = "../constants/abi.json";

module.exports = {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  frontEndContractsFile,
  frontEndAbiFile,
};

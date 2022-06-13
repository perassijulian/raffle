const {
  frontEndContractsFile,
  frontEndAbiFile,
} = require("../helper-hardhat-config");
const fs = require("fs");
const { network } = require("hardhat");

module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Writing to front end...");
    console.log("Upadting contract addresses..");
    const raffle = await ethers.getContract("Raffle");
    const contractAddresses = JSON.parse(
      fs.readFileSync(frontEndContractsFile, "utf8")
    );
    if (network.config.chainId.toString() in contractAddresses) {
      if (
        !contractAddresses[network.config.chainId.toString()].includes(
          raffle.address
        )
      ) {
        console.log('Adding a new address to an existing network"');
        contractAddresses[network.config.chainId.toString()].push(
          raffle.address
        );
      }
    } else {
      console.log('Creating a new network id with their address"');
      contractAddresses[network.config.chainId.toString()] = [raffle.address];
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));

    console.log("Updating abi..")
    fs.writeFileSync(
      frontEndAbiFile,
      raffle.interface.format(ethers.utils.FormatTypes.json)
    );
    console.log("Front end written!");
  }
};

module.exports.tags = ["all", "frontend"];

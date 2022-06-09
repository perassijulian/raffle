const { assert } = require("chai");
const { network, deployments, ethers } = require("hardhat")
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle unit tests", async function () {
      let raffle, vrfCoordinatorV2Mock, deployer;
      const chainId = network.config.chainId;

      beforeEach(async function () {
        const accounts = await ethers.getSigners();
        deployer = accounts[0]
        await deployments.fixture(["all"]);
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
      });

      describe("constructor", async function () {
        it("initializes raffle correctly", async function () {
          const raffleState = raffle.getRaffleState();
          const interval = raffle.getInterval();
          log("holi");
          assert.equal(raffleState.toString(), "0");
          assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
        });
      });
    });

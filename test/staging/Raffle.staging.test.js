const { assert, expect } = require("chai");
const { network, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", function () {
      let raffle, raffleContract, raffleEntranceFee, player;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        player = accounts[1];
        raffleContract = await ethers.getContract("Raffle");
        raffle = raffleContract.connect(player);
        raffleEntranceFee = await raffle.getEntranceFee();
      });

      describe("fullfillRandomWords", function () {
        it("works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async function () {
          console.log("Setting up test...");
          const startingTimeStamp = await raffle.getLastTimeStamp();
          const accounts = await ethers.getSigners();

          console.log("Setting up Listener...");
          await new Promise(async (resolve, reject) => {
            // setup listener before we enter the raffle
            // Just in case the blockchain moves REALLY fast
            await raffle.once("WinnerPicked", async () => {
              console.log("WinnerPicked event fired!");
              try {
                const raffleState = await raffle.getRaffleState();
                const recentWinner = await raffle.getRecentWinner();
                const winnerEndingBalance = await accounts[0].getBalance();
                const lastTimeStamp = await raffle.getLastTimeStamp();

                await expect(raffle.getPlayer(0)).to.be.reverted;
                assert.equal(raffleState.toString(), "0");
                assert.equal(recentWinner, accounts[0].address);
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(raffleEntranceFee).toString()
                );
                assert(startingTimeStamp < lastTimeStamp);
                resolve();
              } catch (error) {
                console.log(error);
                reject(e);
              }
            });
            console.log("Entering raffle...");
            await raffle.enterRaffle({ value: raffleEntranceFee });
            console.log("Waiting time...");
            const winnerStartingBalance = await accounts[0].getBalance();
          });
        });
      });
    });

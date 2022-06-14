const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Lottery Unit Tests", function () {
      let lottery,
        lotteryContract,
        vrfCoordinatorV2Mock,
        lotteryEntranceFee,
        interval,
        player;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        player = accounts[1];
        await deployments.fixture(["mocks", "lottery"]);
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        lotteryContract = await ethers.getContract("Lottery");
        lottery = lotteryContract.connect(player);
        lotteryEntranceFee = await lottery.getEntranceFee();
        interval = await lottery.getInterval();
      });

      describe("constructor", function () {
        it("intitiallizes the lottery correctly", async () => {
          const lotteryState = (await lottery.getLotteryState()).toString();
          assert.equal(lotteryState, "0");
          assert.equal(
            interval.toString(),
            networkConfig[network.config.chainId]["keepersUpdateInterval"]
          );
        });
      });

      describe("enterLottery", function () {
        it("reverts when you don't pay enough", async () => {
          await expect(lottery.enterLottery()).to.be.revertedWith(
            "Lottery__SendMoreToEnterLottery"
          );
        });

        it("records player when they enter", async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          const lotteryPlayer = await lottery.getPlayer(0);
          assert.equal(player.address, lotteryPlayer);
        });

        it("records bets when they enter", async () => {
          const bettingCall = (
            Math.random() *
            100 *
            lotteryEntranceFee
          ).toString();
          await lottery.enterLottery({ value: bettingCall });
          const bet = await lottery.getBetByPlayerAddres(player.address);
          assert.equal(bet.toString(), bettingCall);
        });

        it("emits event on enter", async () => {
          await expect(lottery.enterLottery({ value: lotteryEntranceFee }))
            .to.emit(lottery, "LotteryEnter")
            .withArgs(player.address);
        });

        it("doesn't allow entrance when lottery is calculating", async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          await lottery.performUpkeep([]);
          await expect(
            lottery.enterLottery({ value: lotteryEntranceFee })
          ).to.revertedWith("Lottery__LotteryNotOpen");
        });
      });

      describe("checkUpkeep", function () {
        it("returns false if people haven't sent any ETH", async () => {
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          const { upkeepNeeded } = await lottery.checkUpkeep([]);
          assert(!upkeepNeeded);
        });

        it("returns false if lottery isn't open", async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          await lottery.performUpkeep([]);
          const lotteryState = await lottery.getLotteryState();
          const { upkeepNeeded } = await lottery.checkUpkeep([]);
          assert.equal(lotteryState.toString() == "1", upkeepNeeded == false);
        });

        it("returns false if enough time hasn't passed", async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() - 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          const { upkeepNeeded } = await lottery.checkUpkeep([]);
          assert.equal(upkeepNeeded, false);
        });

        it("returns true if enough time has passed, has players, eth, and is open", async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          const { upkeepNeeded } = await lottery.checkUpkeep([]);
          assert(upkeepNeeded);
        });
      });

      describe("performUpkeep", function () {
        it("can only run if checkupkeep is true", async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          const tx = await lottery.performUpkeep([]);
          assert(tx);
        });

        it("reverts if checkup is false", async () => {
          await expect(lottery.performUpkeep([])).to.be.revertedWith(
            "Lottery__UpkeepNotNeeded"
          );
        });

        it("updates the lottery state and emits a requestId", async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
          const txResponse = await lottery.performUpkeep("0x");
          const txReceipt = await txResponse.wait(1);
          const { requestId } = txReceipt.events[1].args;
          assert(requestId.toNumber() > 0);
          const lotteryState = await lottery.getLotteryState();
          assert.equal(lotteryState.toString(), "1");
        });
      });

      describe("fulfillRandomWords", function () {
        beforeEach(async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
        });

        it("can only be called after performupkeep", async () => {
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(0, lottery.address)
          ).to.be.revertedWith("nonexistent request");
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(1, lottery.address)
          ).to.be.revertedWith("nonexistent request");
        });

        it("picks a winner, resets, and sends money", async () => {
          const additionalEntrances = 3;
          const startingIndex = 2;
          const bets = [];
          for (
            let i = startingIndex;
            i < startingIndex + additionalEntrances;
            i++
          ) {
            lottery = lotteryContract.connect(accounts[i]);
            bets[i] = (Math.random() * 100 * lotteryEntranceFee).toString();
            await lottery.enterLottery({ value: bets[i] });
          }
          const startingTimeStamp = await lottery.getLastTimeStamp();
          // This will be more important for our staging tests...
          await new Promise(async (resolve, reject) => {
            lottery.once("WinnerPicked", async () => {
              console.log("WinnerPicked event fired!");
              // assert throws an error if it fails, so we need to wrap
              // it in a try/catch so that the promise returns event
              // if it fails.
              try {
                // Now lets get the ending values...
                const recentWinner = await lottery.getRecentWinner();
                const lotteryState = await lottery.getLotteryState();
                const endingTimeStamp = await lottery.getLastTimeStamp();
                const finishBalance = await accounts[2].getBalance();
                await expect(lottery.getPlayer(0)).to.be.reverted;
                assert.equal(recentWinner.toString(), accounts[2].address);
                assert.equal(lotteryState, 0);
                assert.equal(
                  finishBalance.toString(),
                  startingBalance
                    .add(
                      lotteryEntranceFee
                        .mul(additionalEntrances)
                        .add(lotteryEntranceFee)
                    )
                    .toString()
                );
                assert(endingTimeStamp > startingTimeStamp);
                resolve();
              } catch (e) {
                reject(e);
              }
            });
            const tx = await lottery.performUpkeep("0x");
            const txReceipt = await tx.wait(1);
            const startingBalance = await accounts[2].getBalance();
            await vrfCoordinatorV2Mock.fulfillRandomWords(
              txReceipt.events[1].args.requestId,
              lottery.address
            );
          });
        });
      });
    });

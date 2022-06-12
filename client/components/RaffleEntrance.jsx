import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import abi from "../constants/abi";
import contractAddresses from "../constants/contractAddresses";
import { useNotification } from "web3uikit";

const RaffleEntrance = () => {
  const [entranceFee, setEntranceFee] = useState("0");
  const [numPlayers, setNumPlayers] = useState("0");
  const [lastWinner, setLastWinner] = useState(null);
  const dispatch = useNotification();
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const raffleAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const { runContractFunction: enterRaffle } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
    params: {},
  });

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  const handleSuccess = async (tx) => {
    await tx.wait(1);
    handleNotification();
    updateUI();
  };

  const handleNotification = () => {
    dispatch({
      type: "info",
      message: "You are in the raffle!",
      title: "Transaction succeded",
      icon: "bell",
      position: "topR",
    });
  };

  const updateUI = async () => {
    const entranceFeeCall = (await getEntranceFee()).toString();
    const lastWinnerCall = await getRecentWinner();
    const numPlayersCall = (await getNumberOfPlayers()).toString();
    setEntranceFee(entranceFeeCall);
    setLastWinner(lastWinnerCall);
    setNumPlayers(numPlayersCall);
  };

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  return (
    <div className="flex justify-center p-3">
      {raffleAddress ? (
        <div className="flex flex-col items-center">
          <span>Entrance fee: {ethers.utils.formatUnits(entranceFee, "ether")}</span>
          <span>Number of players: {numPlayers}</span>
          <span>Last winner: {lastWinner}</span>
          <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded py-2 px-4 mt-2"
            onClick={async () =>
              await enterRaffle({
                onSuccess: handleSuccess,
                onError: (e) => console.log(e),
              })
            }
          >
            Enter raffle
          </button>
        </div>
      ) : (
        <div>
          <span>No contract address detected</span>
        </div>
      )}
    </div>
  );
};

export default RaffleEntrance;

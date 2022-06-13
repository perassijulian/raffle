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
  const [interval, setInterval] = useState("0");
  const [timeStamp, setTimeStamp] = useState("0");
  const dispatch = useNotification();
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const raffleAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const {
    runContractFunction: enterRaffle,
    isFetching,
    isLoading,
  } = useWeb3Contract({
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

  const { runContractFunction: getLastTimeStamp } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getLastTimeStamp",
    params: {},
  });

  const { runContractFunction: getInterval } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getInterval",
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
    try {
      const entranceFeeCall = (await getEntranceFee()).toString();
      const lastWinnerCall = await getRecentWinner();
      const numPlayersCall = (await getNumberOfPlayers()).toString();
      const intervalCall = (await getInterval()).toString();
      const timeStampCall = (await getLastTimeStamp()).toString();
      setEntranceFee(entranceFeeCall);
      setLastWinner(lastWinnerCall);
      setNumPlayers(numPlayersCall);
      const formattedInterval = intervalCall / (60 * 60 * 24); //To make it in days
      setInterval(formattedInterval);
      const formattedDate = formatDay(timeStampCall, intervalCall);
      setTimeStamp(formattedDate);
    } catch (error) {
      console.log(error);
    }
  };

  const formatDay = (timestamp, interval) => {
    //Multiplied by 1000 to make it in miliseconds
    const date = new Date((parseInt(timestamp) + parseInt(interval)) * 1000);
    const stringDate = date.toString();
    const splitDate = stringDate.split(" ");
    const newDate = [
      splitDate[2],
      splitDate[1],
      splitDate[3],
      "at",
      splitDate[4],
    ];
    return newDate.join(" ");
  };

  const shortenAddress = (address) => {
    return address.slice(0, 6) + "..." + address.slice(address.length - 6);
  };

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  if (!chainId)
    return (
      <div className="m-auto text-l">
        To see the raffle please connect to Rinkeby network
      </div>
    );

  if (chainId !== 4)
    return (
      <div className="m-auto animate-bounce">
        Please switch to Rinkeby network
      </div>
    );

  return (
    <div className="flex justify-center mt-2 pt-5">
      {raffleAddress ? (
        <div className="flex flex-col items-center">
          <span className="font-bold text-xl mb-2">RAFFLE STATS</span>
          {lastWinner !== ethers.constants.AddressZero && (
            <span className="pt-2">
              Last winner: {() => shortenAddress(lastWinner)}
            </span>
          )}
          <span>
            Entrance fee:{" "}
            <b>{ethers.utils.formatUnits(entranceFee, "ether")} ETH</b>
          </span>
          <span className="pt-2">
            Number of tickets sold: <b>{numPlayers} tickets</b>
          </span>
          <span className="pt-2">
            We raffle every <b>{interval} days</b>
          </span>
          <span className="pt-2">
            Next raffle is on <b>{timeStamp}</b>
          </span>
          <span className="pt-2">
            PRIZE: <b>{ethers.utils.formatUnits(entranceFee, "ether")*numPlayers} ETH</b>
          </span>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded py-2 px-4 mt-5 disabled:cursor-not-allowed"
            disabled={isLoading || isFetching}
            onClick={async () =>
              await enterRaffle({
                onSuccess: handleSuccess,
                onError: (e) => console.log(e),
              })
            }
          >
            {isLoading || isFetching ? (
              <div className="animate-spin spinner-border h-5 w-5 border-b-2 rounded-full"></div>
            ) : (
              "Enter raffle"
            )}
          </button>
          <span className="mt-5 font-extralight">
            Contract:{" "}
            <a
              target="_blank"
              href={`https://rinkeby.etherscan.io/address/${raffleAddress}#code`}
            >
              {raffleAddress}
            </a>
          </span>
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

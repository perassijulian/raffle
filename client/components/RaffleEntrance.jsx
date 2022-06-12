import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import abi from "../constants/abi";
import contractAddresses from "../constants/contractAddresses";

const RaffleEntrance = () => {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const raffleAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;
  const [entranceFee, setEntranceFee] = useState("0");

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

  const handleEnter = async () => {
    const res = await enterRaffle()
    console.log('res:', res);
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      const updateUI = async () => {
        const entranceFeeCall = (await getEntranceFee()).toString();
        setEntranceFee(entranceFeeCall);
      };
      updateUI();
    }
  }, [isWeb3Enabled]);

  return (
    <div>
      {raffleAddress ? (
        <div>
          Entrance fee: {ethers.utils.formatUnits(entranceFee, "ether")}
          <button onClick={handleEnter}>Enter raffle</button>
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

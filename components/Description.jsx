const Description = () => {
  return (
    <div className="flex flex-col items-center mt-2 pt-5 border-r-2">
      <span className="font-bold text-xl">WEB3 LOTTERY</span>
      <div className="mt-2 px-10 ">
        <div className="indent-7">
          Raffle carried out through blockchain. The raffle is configured at the
          time of deploy where the entrance fee and time interval to be raffled
          are defined.
        </div>
        <div className="pt-2 indent-7">
          The randomness is provided by chainlink. Its keepers are used to carry
          it out to automate its operation . We need to be sure that we have
          enough LINK in our account.
        </div>
        <div className="pt-2 indent-7">
          The smart contracts are developed in Solidity and deployed to the
          Rinkeby test network. For the frontend I used Next.js together with
          tailwind.
        </div>
        <div className="pt-2 indent-7">
          As it is just on a test network you can check it out without need to
          put real money! You just need to have a wallet (I recommend
          downloading{" "}
          <a
            target="_blank"
            className="text-blue-500"
            href="https://metamask.io/"
          >
            Metamask
          </a>
          ) and then google for a "
          <a
            target="_blank"
            className="text-blue-500"
            href="https://www.google.com/search?q=rinkeby+faucet"
          >
            rinkeby faucet
          </a>
          ".
        </div>
      </div>
    </div>
  );
};

export default Description;

import { ConnectButton } from "web3uikit";

const Header = () => {
  return (
    <div className="flex items-center justify-between border-b-2 p-2 w-full">
      <h1 className="text-xl font-bold">PERASSI</h1>
      <ConnectButton moralisAuth={false}/>
    </div>
  );
};

export default Header;

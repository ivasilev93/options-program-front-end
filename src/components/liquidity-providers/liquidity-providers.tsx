import { useEffect, useState } from "react"
import { useNavigate } from "react-router";
import { useMarket } from "@/app/common/market-context";
import { IoIosArrowBack } from "react-icons/io";
import { optionsProgram } from './liquidity-providers-data-access'
import { getTokenPrice } from "@/app/common/token-manager";
import { useWallet } from "@solana/wallet-adapter-react";
import { DepositForm, WithdrawForm } from "./luquidity-providers-ui";

export default function LiquidityProvidersFeature() {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const { selectedMarket } = useMarket();
  const [userLpTokens, setUserLpTokens] = useState({});
  const [assetPrice, setAssetPrice] = useState(0);
  const { getUserLpBalance } = optionsProgram();
  const [actionType, setActionType] = useState("DEPOSIT");
  const [priceChange, setPriceChange] = useState({ value: 0, isPositive: true });
  
  useEffect(() => {
    if (selectedMarket) {
        const fetchPrice = async () => {
            // Choose one of the methods above based on your oracle source
            const price = await getTokenPrice(selectedMarket.account.assetMint.toBase58());
            if (assetPrice && price) {
              const change = price - assetPrice;
              setPriceChange({ value: change, isPositive: change >= 0 });
            }
            setAssetPrice(Number(price));
          };
          
          fetchPrice();
          console.log('qweqwe', priceChange)
          const interval = setInterval(fetchPrice, 5000); // every 5 seconds          
          return () => clearInterval(interval);
    } else {
        navigate('/');
    }
  }, [selectedMarket, navigate]);

  //Fetch user LPtokens
  useEffect(() => {
    const fetchUserLpBalance = async () => {
      if (!selectedMarket || !publicKey) return;

      try {
        const tokenBalance = await getUserLpBalance(selectedMarket.account.id, publicKey.toBase58());

        setUserLpTokens(tokenBalance);
      } catch (err) {
        console.log("Failed to fetch token balance", err);
        setUserLpTokens(0);
      }
    }

    fetchUserLpBalance();
  }, [selectedMarket, publicKey])

  
  const formatBNtoUsd = (bn: any, decimals = 0) => {
    if (!bn) return "0";
    const tokenAmount = bn.toNumber() / Math.pow(10, decimals);
    return (tokenAmount * (assetPrice ?? 0)).toLocaleString();
  };

  const formatToTokenCount = (bn: any, decimals = 0) => {
    if (!bn) return "0";
    const tokenAmount = bn.toNumber() / Math.pow(10, decimals);
    return tokenAmount
  };
  
  const calculateProfitability = () => {
    if (!selectedMarket) return "0%";
    const premiums = selectedMarket.account.premiums.toNumber();
    const totalReserve = selectedMarket.account.reserveSupply.toNumber();
    if (totalReserve === 0) return "0%";
    return ((premiums / totalReserve) * 100).toFixed(2) + "%";
  };
  
  // Prevents flash of content before redirect
  if (!selectedMarket) {
    return null;
  }
    
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center mb-6">
      {/* <div className="absolute left-6"> */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <IoIosArrowBack size={20} />
          <span className="ml-1">Back to Markets</span>
        </button>
      </div>
      
      <div className="bg-white rounded-xl">
        <div className="bg-white px-6 py-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-sky-400 bg-clip-text text-transparent">
            {actionType === "DEPOSIT" ? "Deposit into" : "Withdraw from"} {selectedMarket.account.name}
          </h1>
          <p className="text-sm text-gray-600 opacity-80">
            Provide liquidity and earn premiums
          </p>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Market Info */}
            <div className="space-y-4">
              <div className="rounded-lg pt-4 pb-4">
              {/* <div className="rounded-lg bg-gray-50 p-4"> */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Reserve ($USD)</p>
                    <p className="text-lg font-medium">
                      ${formatBNtoUsd(selectedMarket.account.reserveSupply, selectedMarket.account.assetDecimals)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reserve (tokens)</p>
                    <p className="text-lg font-medium">{formatToTokenCount(selectedMarket.account.reserveSupply, selectedMarket.account.assetDecimals)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Commited ($USD)</p>
                    <p className="text-lg font-medium">
                      ${formatBNtoUsd(selectedMarket.account.committedReserve, selectedMarket.account.assetDecimals)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Commited (tokens)</p>
                    <p className="text-lg font-medium">{formatToTokenCount(selectedMarket.account.committedReserve, selectedMarket.account.assetDecimals)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Premiums ($USD)</p>
                    <p className="text-lg font-medium">
                      ${formatBNtoUsd(selectedMarket.account.premiums, selectedMarket.account.assetDecimals)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Premiums (tokens)</p>
                    <p className="text-lg font-medium">{formatToTokenCount(selectedMarket.account.premiums, selectedMarket.account.assetDecimals)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Profitability</p>
                    <p className="text-lg font-medium text-green-600">{calculateProfitability()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Protocol Fee</p>
                    <p className="text-lg font-medium">{selectedMarket.account.feeBps / 100}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Volatility</p>
                    <p className="text-lg font-medium">{selectedMarket.account.volatilityBps / 100}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Price</p>
                    <div className="flex items-end">
                        <span className="text-2xl font-bold">${assetPrice ? assetPrice.toFixed(2) : "..."}</span>
                        {
                        // priceChange.value !== 0 && 
                        (
                          <span className={`ml-2 text-sm ${priceChange.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {priceChange.isPositive ? '▲' : '▼'} ${Math.abs(priceChange.value).toFixed(4)}
                          </span>
                        )}
                      </div>
                  </div>
                </div>
              </div>

              <div className="py-2">
                <p className="text-sm text-gray-500 mb-1">Your LP token balance</p>
                <p className="font-mono text-sm p-2 rounded break-all">
                  {userLpTokens?.value?.uiAmount ?? 0}
                </p>
              </div>
              
              <div className="py-2">
                <p className="text-sm text-gray-500 mb-1">Asset</p>
                <p className="font-mono text-sm p-2 rounded break-all">
                {/* <p className="font-mono text-sm bg-gray-50 p-2 rounded truncate"> */}
                  {selectedMarket.account.priceFeed}
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 mt-4">
                <h3 className="text-blue-800 font-medium mb-2">About Liquidity Provision</h3>
                <p className="text-sm text-blue-700">
                  By depositing assets, you'll receive LP tokens representing your share of the pool.
                  Earn premiums from options traders while supporting market liquidity. 
                </p>
                <p className="text-sm text-blue-700">
                    <strong>Protocol Fees are deducted from the premiums.</strong>
                </p>
              </div>
            </div>
            
            {/* Right Column - Deposit Form */}
            <div className="bg-gray-50 rounded-lg p-4 shadow-2xl ">
              {/* <h2 className="text-lg font-medium mb-4">Deposit Assets</h2> */}
               {/* Deposiw/Withdraw */}
               <div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button 
                      className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                        actionType === "DEPOSIT" 
                          ? "bg-blue-700 text-white" 
                          : "bg-white border border-gray-200 text-gray-700"
                      }`}
                      onClick={() => setActionType("DEPOSIT")}
                    >
                      Deposit
                    </button>
                    <button 
                      className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                        actionType === "WITHDRAW" 
                          ? "bg-blue-700 text-white" 
                          : "bg-white border border-gray-200 text-gray-700"
                      }`}
                      onClick={() => setActionType("WITHDRAW")}
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              
              { actionType === "DEPOSIT" ?
                <DepositForm assetPrice={assetPrice} />
                :
                <WithdrawForm assetPrice={assetPrice} />
              }             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
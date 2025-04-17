import { useEffect, useState } from "react"
import { useNavigate } from "react-router";
import { useMarket } from "@/app/common/market-context";
import { IoIosArrowBack } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { optionsProgram } from './liquidity-providers-data-access'
import { getTokenPrice } from "@/app/common/token-manager";
// import { formatNumber, formatUSD } from "@/lib/utils"; // Assuming you have utility functions

export default function LiquidityProvidersFeature() {
  const navigate = useNavigate();
  const { selectedMarket } = useMarket();
  const [amount, setAmount] = useState("");
  const [usdAmount, setUsdAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5); // Default 0.5%
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);
  const [estimatedLpTokens, setEstimatedLpTokens] = useState(0);
  const [assetPrice, setAssetPrice] = useState(null);
  const { depositMarket } = optionsProgram();
  
  useEffect(() => {
    if (selectedMarket) {
        const fetchPrice = async () => {
            // Choose one of the methods above based on your oracle source
            const price = await getTokenPrice(selectedMarket.account.assetMint.toBase58());
            setAssetPrice(price);
          };
          
          fetchPrice();
          // Optional: Set up interval to update price regularly
          const interval = setInterval(fetchPrice, 30000); // every 30 seconds
          
          return () => clearInterval(interval);
    } else {
        navigate('/');
    }
  }, [selectedMarket, navigate]);
  
  // Handle amount changes
  useEffect(() => {
    if (amount) {
      const usdValue = parseFloat(amount) * (assetPrice ?? 0);
      setUsdAmount(usdValue.toFixed(2));
      
      // Calculate estimated LP tokens (simplified for demo)
      // In production this would involve a more complex calculation based on the market state
      const lpEstimate = parseFloat(amount) * (selectedMarket?.account.lpMinted / 
        (selectedMarket?.account.reserveSupply + selectedMarket?.account.committedReserve));
      setEstimatedLpTokens(isNaN(lpEstimate) ? 0 : lpEstimate);
    } else {
      setUsdAmount("");
      setEstimatedLpTokens(0);
    }
  }, [amount, selectedMarket]);
  
  // Handle USD amount changes
  const handleUsdChange = (value: any) => {
    setUsdAmount(value);
    if (value) {
      const tokenAmount = parseFloat(value) / (assetPrice ?? 0);
      setAmount(tokenAmount.toFixed(6));
    } else {
      setAmount("");
    }
  };
  
  const formatBN = (bn: any, decimals = 0) => {
    if (!bn) return "0";
    const tokenAmount = bn.toNumber() / Math.pow(10, decimals);
    return (tokenAmount * (assetPrice ?? 0)).toLocaleString();
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
  
  const handleDeposit = async () => {

    const amountInTokens = parseFloat(amount) * Math.pow(10, selectedMarket.account.assetDecimals);
    console.log(slippage/100)
    const slippageDecimal = slippage/100;
    const minAmountOut = amountInTokens * (1 - slippageDecimal);

    const depositPayload = {
        amount: amountInTokens,
        min_amount_out: minAmountOut,
        ix: selectedMarket.account.id,
        mint: selectedMarket.account.assetMint.toBase58()
    };

    try {
        await depositMarket.mutateAsync(depositPayload);
    } catch(err) {
        console.log('Error here: ', err);
    }
    
  };
  
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
            Stake into {selectedMarket.account.name}
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
                    <p className="text-sm text-gray-500">Pool liquidity</p>
                    <p className="text-lg font-medium">
                      ${formatBN(selectedMarket.account.reserveSupply.add(selectedMarket.account.premiums), 
                      selectedMarket.account.assetDecimals)}
                    </p>
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
                </div>
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
              <h2 className="text-lg font-medium mb-4">Deposit Assets</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Amount</label>
                  <div className="relative rounded-lg border border-gray-200 bg-white">
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full p-3 outline-none" 
                      placeholder="0.00"
                    />
                    <div className="absolute right-3 top-3 bg-gray-100 px-2 py-1 rounded text-sm">
                      {selectedMarket.account.name}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">USD Equivalent</label>
                  <div className="relative rounded-lg border border-gray-200 bg-white">
                    <input 
                      type="number" 
                      value={usdAmount}
                      onChange={(e) => handleUsdChange(e.target.value)}
                      className="w-full p-3 outline-none" 
                      placeholder="0.00"
                    />
                    <div className="absolute right-3 top-3 bg-gray-100 px-2 py-1 rounded text-sm">
                      USD
                    </div>
                  </div>
                </div>
                
                <div className="py-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estimated LP tokens (Apprx.):</span>
                    <span className="font-medium">{estimatedLpTokens.toFixed(6)}</span>
                  </div>
                </div>
                
                <div className="py-2">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">Slippage Tolerance</span>
                      <button 
                        onClick={() => setShowSlippageSettings(!showSlippageSettings)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <IoSettingsOutline size={16} />
                      </button>
                    </div>
                    <span className="text-sm font-medium">{slippage}%</span>
                  </div>
                  
                  {showSlippageSettings && (
                    <div className="bg-white p-3 rounded-lg shadow-md mb-3">
                      <input
                        type="range"
                        min="0.1"
                        max="5"
                        step="0.1"
                        value={slippage}
                        onChange={(e) => setSlippage(parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0.1%</span>
                        <span>5%</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={handleDeposit}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Stake
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
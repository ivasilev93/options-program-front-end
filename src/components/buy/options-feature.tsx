import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router";
// import { useMarket } from "@/app/common/market-context";
import { IoIosArrowBack } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
// import { optionsProgram } from '../buy/options-data-access'
import { getTokenPrice } from "@/app/common/token-manager";
import { BN } from "@coral-xyz/anchor";
import { calculateOptionPremium } from "@/app/common/math-helper";
import { MarketAccount, rpcCalls } from "@/app/common/web3";
import { TokenInfo } from "@/app/common/market-context";
import toast from "react-hot-toast";
import { useTransactionToast } from "../ui/ui-layout";
// import { calculatePremium } from "@/app/common/math-helper";

const deviationOptions = [
  { label: "-20%", value: -20, deviation: 80, obj: { n20: {} } },
  { label: "-15%", value: -15, deviation: 85, obj: { n15: {} } },
  { label: "-10%", value: -10, deviation: 90, obj: { n10: {} } },
  { label: "-5%", value: -5, deviation: 95, obj: { n5: {} } },
  { label: "0%", value: 0, deviation: 100, obj: { p0: {} } },
  { label: "+5%", value: 5, deviation: 105, obj: { p5: {} } },
  { label: "+10%", value: 10, deviation: 110, obj: { p10: {} } },
  { label: "+15%", value: 15, deviation: 115, obj: { p15: {} } },
  { label: "+20%", value: 20, deviation: 120, obj: { p20: {} } },
];

function calcStrikeFromDeviation(assetPrice: number, deviation: number) {
  const scaledPrice = Math.round(assetPrice * 1e8);
  
  const adjusted = Math.floor((scaledPrice * deviation) / 100);
  const step = scaledPrice < 1e8 ? 1e6 : 1e8;
  
  const rounded = Math.floor((adjusted + step / 2) / step);
  
  // Return scaled result
  const result = rounded * step;
  
  return result / 1e8;
}


export default function OptionsBuyingFeature() {
  const navigate = useNavigate();
  const transactionToast = useTransactionToast()
  const { buyOption } = rpcCalls();
  // const { selectedMarket } = useMarket();
  const [optionType, setOptionType] = useState("CALL");
  const [strikePrice, setStrikePrice] = useState("");
  const [expirySetting, setexpirySetting] = useState(7);
  const [quantity, setQuantity] = useState(0);
  const [slippage, setSlippage] = useState(0.5); // Default 0.5%
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);
  const [estimatedPremium, setEstimatedPremium] = useState(0);
  const [estimatedPremiumTokens, setEstimatedPremiumTokens] = useState(0);
  const [assetPrice, setAssetPrice] = useState(0);
  const [priceChange, setPriceChange] = useState({ value: 0, isPositive: true });
  const location = useLocation();
  const selectedMarket = location.state?.selectedMarket as MarketAccount;
  const tokenData = location.state?.tokenData as TokenInfo;
  // const { buyOption } = optionsProgram();
  const [strikeDeviation, setStrikeDeviation] = useState(0); 

  useEffect(() => {
    if (selectedMarket) {
      console.log('selected', selectedMarket)

        const fetchPrice = async () => {
            const price = await getTokenPrice(selectedMarket.assetMint);
            if (assetPrice && price) {
                const change = price - assetPrice;
                setPriceChange({ value: change, isPositive: change >= 0 });
              }
            setAssetPrice(Number(price));
        };
          
        fetchPrice();
        const interval = setInterval(fetchPrice, 5000); // every 5 seconds          
        return () => clearInterval(interval);

        //Incase rate limits are hit
        // setAssetPrice(Number(tokenData.price))
    } else {
        navigate('/');
    }
  }, [selectedMarket, navigate, optionType]);
  
  // Calculate estimated premium when relevant inputs change
  useEffect(() => {
    if (strikePrice && quantity && assetPrice) {     
      // This is a simplified calculation for demo purposes
      // In production, you would use a proper options pricing model (Black-Scholes, etc.)
      const strikePriceFloat = parseFloat(strikePrice);
      // const quantityFloat = parseFloat(quantity);

      if (strikePriceFloat === 0) {
        setEstimatedPremium(0);
        return;
      }

      // const timeToExpityInYears = 0 ; //expiryDays / 365;
      
      // const volatility= (selectedMarket?.account.volatilityBps ?? 0) / 10000;
      console.log('expirySetting', expirySetting)

      const vol = getVol(expirySetting);
      const expiry = volToSecs(expirySetting);

      console.log('vol', vol)
      
      const [usdPremium, tokens] = calculateOptionPremium(
         BigInt(Math.round(strikePriceFloat * Math.pow(10, 8))),
         BigInt(Math.round(assetPrice * Math.pow(10, 8))),
         BigInt(expiry),
         selectedMarket.assetDecimals || 0,
         BigInt(vol),
         optionType,
         BigInt(quantity)
       )
      setEstimatedPremium(Number(usdPremium) / Math.pow(10, 8));
      setEstimatedPremiumTokens(Number(tokens));
    } else {
      setEstimatedPremium(0);
    }
  }, [strikePrice, quantity, expirySetting, optionType, assetPrice, selectedMarket]);
  
  useEffect(() => {
    const devObj = deviationOptions.find((d) => d.value === strikeDeviation);
    if (assetPrice && devObj) {
      const strike = calcStrikeFromDeviation(assetPrice, devObj.deviation);

      setStrikePrice((strike).toFixed(2)); // keep as string for input
    }
  }, [assetPrice, strikeDeviation]);

  
  const formatBN = (bn: BN, decimals = 0) => {
    if (!bn) return "0";
    const tokenAmount = bn.toNumber() / Math.pow(10, decimals);
    return (tokenAmount * (assetPrice ?? 0)).toLocaleString();
  };
  
  // Prevents flash of content before redirect
  if (!selectedMarket) {
    return null;
  }
  

  const handleBuyOption = async () => {
    const strikePriceScaled = parseFloat(strikePrice) * Math.pow(10, 8);
    // const quantityInTokens = parseFloat(quantity) * Math.pow(10, selectedMarket.account.assetDecimals);
    // const slippageDecimal = slippage/100;
    // const maxPremiumCost = estimatedPremium * (1 + slippageDecimal) * Math.pow(10, selectedMarket.account.assetDecimals);

    // const nowInSeconds = Math.floor(Date.now() / 1000); // UNIX timestamp in seconds
    // const expiryTimestamp = nowInSeconds + 0 * 24 * 60 * 60;

    const buyOptionPayload = {
        marketIx: selectedMarket.id,
        option: optionType,
        strikePrice: strikePriceScaled,
        expirySetting: expirySetting,
        quantity: quantity,
        mint: selectedMarket.assetMint,
        estPremium: estimatedPremiumTokens
    };

    console.log('payload: ', buyOptionPayload);
    // return;

    const devObj = deviationOptions.find((d) => d.value === strikeDeviation);
    console.log('devObj: ', devObj?.obj);


    try {
        const signature = await buyOption(selectedMarket.id,
          optionType,
          devObj?.obj,
          expirySetting,
          quantity,
          selectedMarket.assetMint,
          estimatedPremiumTokens);

          transactionToast(signature)

    } catch(err) {
        console.log('Error: ', err);
        toast.error('Failed')
    }
  };

  const handleExpiryPreset = (set: number) => {
    setexpirySetting(set);
  };

  const getVol = (expiry: number) => {
    switch (expiry) {
      case 0: 
        return selectedMarket.hour1VolatilityBps
      case 1: 
        return selectedMarket.hour1VolatilityBps
      case 2: 
        return selectedMarket.hour1VolatilityBps
      case 3: 
        return selectedMarket.hour1VolatilityBps
      case 4: 
        return selectedMarket.hour1VolatilityBps
    default:
      return 0
   }
  } 

  const volToSecs = (expiry: number) => {
    switch (expiry) {
      case 0: 
        return 60 * 60
      case 1: 
        return 4 * 60 * 60
      case 2: 
        return 24 * 60 * 60
      case 3: 
        return 3 * 24 * 60 * 60
      case 4: 
        return 7 * 24 * 60 * 60
    default:
      return 0
   }
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center mb-6">
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
            Buy Options on { tokenData.symbol } market
          </h1>
          <p className="text-sm text-gray-600 opacity-80">
            Trade options with customizable strike prices and expiry dates
          </p>
        </div>

        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Market Info */}
            <div className="space-y-4">
              <div className="rounded-lg pt-4 pb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Pool liquidity</p>
                    <p className="text-lg font-medium">
                      ${
                      formatBN(new BN(selectedMarket.reserveSupply).add(new BN(selectedMarket.premiums)), 
                      selectedMarket.assetDecimals)
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Price</p>
                    <div className="flex items-end">
                        <span className="text-2xl font-bold">${assetPrice ? assetPrice.toFixed(4) : "..."}</span>
                        {
                        // priceChange.value !== 0 && 
                        (
                          <span className={`ml-2 text-sm ${priceChange.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {priceChange.isPositive ? '▲' : '▼'} ${Math.abs(priceChange.value).toFixed(4)}
                          </span>
                        )}
                      </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Protocol Fee</p>
                    <p className="text-lg font-medium">{selectedMarket.feeBps / 100}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">1 Hr Historic Vol</p>
                    <p className="text-lg font-medium">{selectedMarket.hour1VolatilityBps / 100}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">4 Hr Historic Vol</p>
                    <p className="text-lg font-medium">{selectedMarket.hour4VolatilityBps / 100}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">1 Day Historic Vol</p>
                    <p className="text-lg font-medium">{selectedMarket.day1VolatilityBps / 100}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">3 Day Historic Vol</p>
                    <p className="text-lg font-medium">{selectedMarket.day3VolatilityBps / 100}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">1 Week Historic Vol</p>
                    <p className="text-lg font-medium">{selectedMarket.weekVolatilityBps / 100}%</p>
                  </div>
                  {/*
                    <div>
                    <p className="text-sm text-gray-500">Profitability</p>
                    <p className="text-lg font-medium text-green-600">{calculateProfitability()}</p>
                  </div>
                  */}
                </div>
              </div>
              
              <div className="py-2">
                <p className="text-sm text-gray-500 mb-1">Asset mint</p>
                <p className="font-mono text-sm p-2 rounded break-all">
                  {selectedMarket.priceFeed}
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 mt-4">
                {/* <h3 className="text-blue-800 font-medium mb-2">About Options Trading</h3> */}
                <p className="text-sm text-blue-700">
                  <strong>CALL Options</strong> give you the right to buy the asset at your chosen strike price, 
                  regardless of how high the market price goes. Profitable when prices rise above strike plus premium.
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  <strong>PUT Options</strong> give you the right to sell the asset at your chosen strike price,
                  regardless of how low the market price falls. Profitable when prices fall below strike minus premium.
                </p>
              </div>
            </div>
            
            {/* Right Column - Options Buying Form */}
            <div className="bg-gray-50 rounded-lg p-4 shadow-2xl">
              {/* <h2 className="text-lg font-medium mb-4">Buy Options</h2> */}
              
              <div className="space-y-4">
                {/* Option Type Selection */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Option Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                        optionType === "CALL" 
                          ? "bg-green-600 text-white" 
                          : "bg-white border border-gray-200 text-gray-700"
                      }`}
                      onClick={() => setOptionType("CALL")}
                    >
                      CALL
                    </button>
                    <button 
                      className={`py-2 px-4 rounded-lg font-medium transition-colors 
                        ${
                          optionType === "PUT" 
                            ? "bg-red-500 text-white" 
                            : "bg-white border border-gray-200 text-gray-700"
                        }`}
                        onClick={() => setOptionType("PUT")}
                    >
                      PUT
                    </button>
                  </div>
                </div>
                
                {/* Strike Price */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Strike Price</label>
                  <div className="relative rounded-lg border border-gray-200 bg-white">
                    <input
                      type="text"
                      value={strikePrice}
                      readOnly
                      className="w-full p-3 outline-none bg-white cursor-not-allowed"
                      placeholder="0.00"
                    />
                    <div className="absolute right-3 top-3 bg-gray-100 px-2 py-1 rounded text-sm">
                      USD
                    </div>
                  </div>
                  <div className="mb-2">
                    <input
                      type="range"
                      min={-20}
                      max={20}
                      step={5}
                      value={strikeDeviation}
                      onChange={(e) => setStrikeDeviation(Number(e.target.value))}
                      className="w-full"
                      list="strike-marks"
                    />
                    <datalist id="strike-marks">
                      {deviationOptions.map((opt) => (
                        <option key={opt.value} value={opt.value} label={opt.label} />
                      ))}
                    </datalist>
                    <div className="flex justify-between text-xs mt-1 text-gray-500">
                      {deviationOptions.map((opt) => (
                        <span key={opt.value}>{opt.label}</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Expiry */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Expiry</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                  <button 
                      className={`text-sm py-1 rounded-md transition-colors ${
                        expirySetting === 0 
                          ? "bg-blue-600 text-white" 
                          : "bg-white border border-gray-200 text-gray-700"
                      }`}
                      onClick={() => handleExpiryPreset(0)}
                    >
                      1 Hour
                    </button>
                    <button 
                      className={`text-sm py-1 rounded-lg transition-colors ${
                        expirySetting === 1 
                          ? "bg-blue-600 text-white" 
                          : "bg-white border border-gray-200 text-gray-700"
                      }`}
                      onClick={() => handleExpiryPreset(1)}
                    >
                      4 Hours
                    </button>
                    <button 
                      className={`text-sm py-1 rounded-lg transition-colors ${
                        expirySetting === 2 
                          ? "bg-blue-600 text-white" 
                          : "bg-white border border-gray-200 text-gray-700"
                      }`}
                      onClick={() => handleExpiryPreset(2)}
                    >
                      1 Day
                    </button>
                    <button 
                      className={`text-sm py-1 rounded-lg transition-colors ${
                        expirySetting === 3 
                          ? "bg-blue-600 text-white" 
                          : "bg-white border border-gray-200 text-gray-700"
                      }`}
                      onClick={() => handleExpiryPreset(3)}
                    >
                      3 Days
                    </button>
                    <button 
                      className={`text-sm py-1 rounded-lg transition-colors ${
                        expirySetting === 4 
                          ? "bg-blue-600 text-white" 
                          : "bg-white border border-gray-200 text-gray-700"
                      }`}
                      onClick={() => handleExpiryPreset(4)}
                    >
                      1 Week
                    </button>
                  </div>
                </div>
                
                {/* Quantity */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Quantity</label>
                  <div className="relative rounded-lg border border-gray-200 bg-white">
                    <input 
                      type="number" 
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full p-3 outline-none" 
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                {/* Slippage Tolerance */}
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
                
                {/* Premium Estimation */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-800">Estimated Premium:</span>
                    <span className="font-medium text-blue-900">
                      ${(estimatedPremium).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={handleBuyOption}
                  disabled={!strikePrice || quantity <= 0}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    optionType === "CALL"
                      ? "bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white"
                      : "bg-red-500 hover:bg-red-700 disabled:bg-gray-300 text-white"
                  }`}
                >
                  Buy {optionType}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
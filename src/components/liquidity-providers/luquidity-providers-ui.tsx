import { useEffect, useState } from "react";
import { useMarket } from "@/app/common/market-context";
import { IoSettingsOutline } from "react-icons/io5";
import { estimateLpShares, estimateWithdrawAmount } from "@/app/common/math-helper";
import { optionsProgram } from "./liquidity-providers-data-access";
import { PublicKey } from "@solana/web3.js";


export function DepositForm({  assetPrice }: { assetPrice: any }) {
    const [amount, setAmount] = useState("");
    const [usdAmount, setUsdAmount] = useState("");
    const [slippage, setSlippage] = useState(0.5); // Default 0.5%
    const [estimatedLpTokens, setEstimatedLpTokens] = useState(0);
    const [showSlippageSettings, setShowSlippageSettings] = useState(false);
    const { selectedMarket } = useMarket();
    const { depositMarket,  } = optionsProgram();
    
      useEffect(() => {
        if (amount) {
          const usdValue = parseFloat(amount) * (assetPrice ?? 0);
          setUsdAmount(usdValue.toFixed(2));
          
          // Calculate estimated LP tokens (simplified for demo)
          // In production this would involve a more complex calculation based on the market state
          const amountInTokens = parseFloat(amount) * Math.pow(10, selectedMarket?.account.assetDecimals ?? 0);
          const estimatedTokenUnits = estimateLpShares(
              amountInTokens, 
              1, 
              selectedMarket?.account.lpMinted.toNumber(), 
              selectedMarket?.account.reserveSupply.toNumber(), 
              selectedMarket?.account.premiums.toNumber(),
            );
    
          const estimatedTokens = estimatedTokenUnits / Math.pow(10, selectedMarket?.account.assetDecimals ?? 0);
      
          setEstimatedLpTokens(estimatedTokens);
        } else {
          setUsdAmount("");
          setEstimatedLpTokens(0);
        }
      }, [amount, selectedMarket]);

    const handleDeposit = async () => {

        const amountInTokens = parseFloat(amount) * Math.pow(10, selectedMarket?.account.assetDecimals ?? 0);
        console.log('slippage', slippage/100)
        const slippageDecimal = slippage/100;
        const minAmountOut = estimatedLpTokens * (1 - slippageDecimal) * Math.pow(10, selectedMarket?.account.assetDecimals ?? 0);
    
        const depositPayload = {
            amount: amountInTokens,
            min_amount_out: minAmountOut,
            ix: selectedMarket?.account.id ?? 0,
            mint: selectedMarket?.account.assetMint.toBase58() ?? ""
        };
    
        console.log('payl', depositPayload)
    
        try {
            await depositMarket.mutateAsync(depositPayload);
        } catch(err) {
            console.log('Error here: ', err);
        }
        
      }

    return (
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
                              {selectedMarket?.account.name}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">USD Equivalent</label>
                          <div className="relative rounded-lg border border-gray-200 bg-white">
                            <input 
                              type="number" 
                              value={usdAmount}
                              // onChange={(e) => handleUsdChange(e.target.value)}
                              className="w-full p-3 outline-none" 
                              placeholder="0.00"
                              disabled
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
                          Deposit
                        </button>
                      </div>
    )
}

export function WithdrawForm({  assetPrice }: { assetPrice: any }) {
    const [lpAmount, setAmount] = useState("");
    const [usdAmount, setUsdAmount] = useState("");
    const [slippage, setSlippage] = useState(0.5); // Default 0.5%
    const [estimatedAssetTokens, setEstimatedAssetTokens] = useState(0);
    const [showSlippageSettings, setShowSlippageSettings] = useState(false);
    const { selectedMarket } = useMarket();
    const { withdrawMarket  } = optionsProgram();
    
      useEffect(() => {
        if (lpAmount) {

            // Calculate estimated Asset tokens from LP tokens
            // LP tokens have same decimals as asset tokens
            const lpAMountInBaseUnits = parseFloat(lpAmount) * Math.pow(10, selectedMarket?.account.assetDecimals ?? 0);

            const withdrawEstimation: number[] = estimateWithdrawAmount(
                lpAMountInBaseUnits,  
                selectedMarket?.account.lpMinted.toNumber(), 
                selectedMarket?.account.reserveSupply.toNumber(), 
                selectedMarket?.account.premiums.toNumber(),
                selectedMarket?.account.committedReserve.toNumber(),
            );
            console.log('withdraw amnt', withdrawEstimation[0]);
            console.log('lp to burn', withdrawEstimation[1]);
            const estimatedBaseAssetTokenUnits = withdrawEstimation[0];

            const estimatedTokens = estimatedBaseAssetTokenUnits / Math.pow(10, selectedMarket?.account.assetDecimals ?? 0);        
            setEstimatedAssetTokens(estimatedTokens);

            const usdValue = parseFloat(lpAmount) * (assetPrice ?? 0);
            setUsdAmount(usdValue.toFixed(2));
        } else {
          setUsdAmount("");
          setEstimatedAssetTokens(0);
        }
      }, [lpAmount, selectedMarket]);

    const handleWithdraw = async () => {

        const amountTokens = parseFloat(lpAmount) * Math.pow(10, selectedMarket?.account.assetDecimals ?? 0);
        const slippageDecimal = slippage/100;
        const minAmountOut = estimatedAssetTokens * Math.pow(10, selectedMarket?.account.assetDecimals ?? 0) * (1 - slippageDecimal);
    
        const withdrawPayload = {
          lp_tokens_to_burn: amountTokens,
          min_amount_out: minAmountOut,
          ix: selectedMarket?.account.id ?? 0,
          mint: selectedMarket?.account.assetMint ?? new PublicKey("")
        };
    
        console.log('payl', withdrawPayload)
    
        try {
            await withdrawMarket.mutateAsync(withdrawPayload);
        } catch(err) {
            console.log('Error here: ', err);
        }
        
    }

    return (
         <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Amount (LP tokens)</label>
                          <div className="relative rounded-lg border border-gray-200 bg-white">
                            <input 
                              type="number" 
                              value={lpAmount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="w-full p-3 outline-none" 
                              placeholder="0.00"
                            />
                            <div className="absolute right-3 top-3 bg-gray-100 px-2 py-1 rounded text-sm">
                              LP
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Asset Equivalent</label>
                          <div className="relative rounded-lg border border-gray-200 bg-white">
                            <input 
                              type="number" 
                              value={estimatedAssetTokens}
                              // onChange={(e) => handleUsdChange(e.target.value)}
                              className="w-full p-3 outline-none" 
                              placeholder="0.00"
                              disabled
                            />
                            <div className="absolute right-3 top-3 bg-gray-100 px-2 py-1 rounded text-sm">
                            {selectedMarket?.account.name}
                            </div>
                          </div>
                        </div>
                        
                        <div className="py-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">USD:</span>
                            <span className="font-medium">{usdAmount}</span>
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
                          onClick={handleWithdraw}
                          disabled={!lpAmount || parseFloat(lpAmount) <= 0}
                          className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                        >
                          Withdraw
                        </button>
                      </div>
    )
}
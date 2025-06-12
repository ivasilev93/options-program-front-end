import { useEffect, useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import { estimateLpShares, estimateWithdrawAmount } from "@/app/common/math-helper";
import { PublicKey } from "@solana/web3.js";
// import { BN } from "@coral-xyz/anchor";
import { MarketAccount, rpcCalls } from "@/app/common/web3";
import { useTransactionToast } from "../ui/ui-layout";
import toast from "react-hot-toast";


export function DepositForm({  assetPrice, onDeposit, selectedMarket, symbol }: { selectedMarket: MarketAccount, assetPrice: any, onDeposit: () => void, symbol: string }) {
    const { depositIntoMarket } = rpcCalls();
    const [amount, setAmount] = useState("");
    const [usdAmount, setUsdAmount] = useState("");
    const [slippage, setSlippage] = useState(0.5); // Default 0.5%
    const [estimatedLpTokens, setEstimatedLpTokens] = useState(0);
    const [showSlippageSettings, setShowSlippageSettings] = useState(false);
    const transactionToast = useTransactionToast()
    
      useEffect(() => {
        if (amount) {
          const usdValue = parseFloat(amount) * (assetPrice ?? 0);
          setUsdAmount(usdValue.toFixed(2));
          
          // Calculate estimated LP tokens (simplified for demo)
          // In production this would involve a more complex calculation based on the market state
          const amountInTokens = parseFloat(amount) * Math.pow(10, selectedMarket.assetDecimals ?? 0);
          const estimatedTokenUnits = estimateLpShares(
              amountInTokens, 
              1, 
              selectedMarket.lpMinted, 
              selectedMarket.reserveSupply, 
              selectedMarket.premiums,
            );
    
          const estimatedTokens = estimatedTokenUnits / Math.pow(10, selectedMarket.assetDecimals ?? 0);
      
          setEstimatedLpTokens(estimatedTokens);
        } else {
          setUsdAmount("");
          setEstimatedLpTokens(0);
        }
      }, [amount, selectedMarket]);

    const handleDeposit = async () => {

        const amountInTokens = parseFloat(amount) * Math.pow(10, selectedMarket.assetDecimals ?? 0);
        const slippageDecimal = slippage/100;
        const minAmountOut = estimatedLpTokens * (1 - slippageDecimal) * Math.pow(10, selectedMarket.assetDecimals ?? 0);  
    
        try {
            const signature = await depositIntoMarket(amountInTokens,
              minAmountOut,
              selectedMarket.id ?? 0,
              selectedMarket.assetMint ?? "");
            
            transactionToast(signature);

            // await depositMarket.mutateAsync(depositPayload);
            onDeposit();
        } catch(err) {
            console.log('Error sending deposit tx: ', err);
            toast.error('Failed')
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
                              {symbol}
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

export function WithdrawForm({  assetPrice, selectedMarket, symbol, onWithdraw }: { assetPrice: any, selectedMarket: MarketAccount, symbol: string, onWithdraw: () => void }) {
    const [lpAmount, setAmount] = useState("");
    const [usdAmount, setUsdAmount] = useState("");
    const [slippage, setSlippage] = useState(0.5); // Default 0.5%
    const [estimatedAssetTokens, setEstimatedAssetTokens] = useState(0);
    const [showSlippageSettings, setShowSlippageSettings] = useState(false);
    const transactionToast = useTransactionToast()
    const { withdrawMarket } = rpcCalls();
    
      useEffect(() => {
        if (lpAmount) {

            // Calculate estimated Asset tokens from LP tokens
            // LP tokens have same decimals as asset tokens
            console.log('lp amount', lpAmount)
            const lpAMountInBaseUnits = parseFloat(lpAmount) * Math.pow(10, selectedMarket.assetDecimals ?? 0);

            const withdrawEstimation: number[] = estimateWithdrawAmount(
                lpAMountInBaseUnits,  
                selectedMarket.lpMinted, 
                selectedMarket.reserveSupply, 
                selectedMarket.premiums,
                selectedMarket.committedReserve
            );
            // console.log('withdraw amnt', withdrawEstimation[0]);
            // console.log('lp to burn', withdrawEstimation[1]);
            const estimatedBaseAssetTokenUnits = withdrawEstimation[0];

            const estimatedTokens = estimatedBaseAssetTokenUnits / Math.pow(10, selectedMarket.assetDecimals ?? 0);        
            setEstimatedAssetTokens(estimatedTokens);

            const usdValue = estimatedTokens * (assetPrice ?? 0);
            setUsdAmount(usdValue.toFixed(2));
        } else {
          setUsdAmount("");
          setEstimatedAssetTokens(0);
        }
      }, [lpAmount, selectedMarket]);

    const handleWithdraw = async () => {

        const amountTokens = parseFloat(lpAmount) * Math.pow(10, selectedMarket.assetDecimals ?? 0);
        const slippageDecimal = slippage/100;
        const minAmountOut = estimatedAssetTokens * Math.pow(10, selectedMarket.assetDecimals ?? 0) * (1 - slippageDecimal);
    
        try {
              const signature = await withdrawMarket(
                amountTokens,
                minAmountOut,
                selectedMarket.id,
                new PublicKey(selectedMarket.assetMint));

                onWithdraw();

                transactionToast(signature);
        } catch(err) {
            console.log('Error sending withdraw tx: ', err);
            toast.error('Failed')
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
                            {symbol}
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
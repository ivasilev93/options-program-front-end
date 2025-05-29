import { PublicKey } from '@solana/web3.js';
// import { optionsProgram } from './positions-data-access'
import { BN } from '@coral-xyz/anchor';
import { useMarket, TokenInfo } from "@/app/common/market-context";
import { fetchTokenData, formatNumber, tokensToMoney } from '@/app/common/token-manager';
import { rpcCalls } from '@/app/common/web3';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTransactionToast } from '../ui/ui-layout';


export function PositionsList({ account }: { account: PublicKey }) {
    const transactionToast = useTransactionToast()
    // const { getUserAccount, exercise } = optionsProgram({ account });
    const { getUserAccount, exercise, fetchMarkets } = rpcCalls();
    // const { allMarkets, prices } = useMarket();   
    const [userOptions, setUserOptions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tokenData, setTokenData] = useState<Record<string, TokenInfo>>({});
    const [markets, setMarkets] = useState<Record<number, any>>({});
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
      const fetchUserAccount = async () => {
          try {
              setIsLoading(true);
              const userAccount = await getUserAccount(account);
              setUserOptions(userAccount.options || []);

              const allMarkets = await fetchMarkets();
              // console.log('allMarkets', allMarkets)

              const marketsByKey = allMarkets.reduce((acc, market) => {
                acc[Number(market.account.id)] = market.account.assetMint.toBase58();
                return acc;
              }, {} as Record<string, TokenInfo>);

              // console.log('marketsByKey', marketsByKey)
              setMarkets(marketsByKey);

              const mintAddresses = allMarkets.map((m) => m.account.assetMint.toBase58());
              const tokenData = await fetchTokenData(mintAddresses);
              setTokenData(tokenData);
              // console.log('tokenData', tokenData)

          } catch (err) {
              console.error('Failed to fetch user account:', err);
          } finally {
              setIsLoading(false);
          }
      };

      fetchUserAccount();
  }, [account, refreshKey]);

    const descaleUsdPrice = (value: number | BN) => {
      const numValue = BN.isBN(value) ? value.toNumber() : value;
      const tvl = (numValue / Math.pow(10, 8));
      return formatNumber(tvl, 4);
    }

    const formatSolanaTimestamp = (expiry: BN) => {
        const exp = expiry.toNumber();

        if (!expiry || exp == 0) 
            return '';

        const millis = exp * 1000; // Convert seconds to milliseconds
        const date = new Date(millis);
        return date.toLocaleString(); // Local time representation
      }

    const onExercise = async (marketIx: number, optionIx: number, mint: string) => {
      try {
        const sign = await exercise(marketIx, optionIx, mint);
        transactionToast(sign);
        setRefreshKey((prev) => prev + 1);
      } catch(err) {
        console.log('Error here: ', err);
      }
    }

    const isIinitialized = (o: any) => {
      return o.isUsed == 1
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">        
        <div className="bg-white rounded-xl">
          <div className="bg-white px-6 py-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-sky-400 bg-clip-text text-transparent">
              Your Positions
            </h1>
            <p className="text-lg text-gray-600 opacity-80 mt-2">
              Track and exercise your positions
            </p>
          </div>
  
          
          <div className="p-4">
          <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center">
            {/* <span className="loading loading-spinner loading-lg"></span> */}
          </div>
        ) : userOptions.length ? (
          <div className="">
            <table className="table w-ful">
              <thead>
                <tr className="bg-white">
                  <th className="text-base px-4 py-3">Market</th>
                  {/* <th className="text-base px-4 py-3 text-right">Name</th> */}
                  <th className="text-base px-4 py-3 text-right">Type</th>
                  <th className="text-base px-4 py-3 text-right">Expiry</th>
                  <th className="text-base px-4 py-3 text-right">Strike price</th>
                  <th className="text-base px-4 py-3 text-right">Quantity</th>
                  <th className="text-base px-4 py-3 text-right">Premium (tokens)</th>
                  <th className="text-base px-4 py-3 text-right">Total Premium (USD)</th>
                </tr>
              </thead>
              <tbody>
                {userOptions.filter(o => isIinitialized(o))
                  .map((o) => {
                  return (                    
                    <tr key={o.ix} className="hover:bg-base-200 border-b border-base-300">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-gray-300">
                            <img
                              src={tokenData[markets[o.marketIx]]?.logoUrl}
                              alt={tokenData[markets[o.marketIx]]?.symbol}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span>{tokenData[markets[o.marketIx]]?.symbol}</span>
                        </div>
                      </td>
                      {/* <td className="px-4 py-3 text-right">{market?.name}</td> */}
                      <td className="px-4 py-3 text-right">{o.optionType === 1 ? "CALL" : "PUT"}</td>
                      <td className="px-4 py-3 text-right">{formatSolanaTimestamp(o.expiry)}</td>
                      <td className="px-4 py-3 text-right">${descaleUsdPrice(o.strikePrice)}</td>
                      <td className="px-4 py-3 text-right">{o.quantity.toNumber()}</td>
                      <td className="px-4 py-3 text-right">{o.premium.toNumber()}</td>
                      <td className="px-4 py-3 text-right">${descaleUsdPrice(o.premiumInUsd)}</td>       
                      <td><button 
                        className="bg-transparent font-semibold py-2 px-4 border border-blue-900 text-blue-900 hover:shadow-md hover:text-blue-700 rounded-md"
                        onClick={() => onExercise(o.marketIx, o.ix, markets[o.marketIx])} 
                        >Exercise</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl mb-2">No Markets</h2>
              <p className="text-base-content/70">No markets found. Create one above to get started.</p>
            </div>
          )}
          </div>
          </div>
        </div>
      </div>
    )
 }
import { PublicKey } from '@solana/web3.js';
import { optionsProgram } from './positions-data-access'
import { BN } from '@coral-xyz/anchor';
import { useMarket } from "@/app/common/market-context";
import { formatNumber, tokensToMoney } from '@/app/common/token-manager';


export function PositionsList({ account }: { account: PublicKey }) {
    const { getUserAccount, exercise } = optionsProgram({ account });
    const { allMarkets, prices } = useMarket();

    const descaleUsdPrice = (value: number | BN) => {
      const numValue = BN.isBN(value) ? value.toNumber() : value;
      const tvl = (numValue / Math.pow(10, 6));
      return formatNumber(tvl, 2);
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
        await exercise.mutateAsync({marketIx: marketIx, optionIx: optionIx, mint: mint});
      } catch(err) {
        console.log('Error here: ', err);
      }
    }

    const isIinitialized = (o: any) => {
      return o.quantity.toNumber() > 0 && o.premium.toNumber() > 0 && o.expiry > 0
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
        {getUserAccount.isLoading ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : getUserAccount.data?.options.length ? (
          <div className="">
          {/* <div className="overflow-x-auto"> */}
            <table className="table w-ful">
              <thead>
                <tr className="bg-white">
                  <th className="text-base px-4 py-3">Market</th>
                  {/* <th className="text-base px-4 py-3 text-right">Name</th> */}
                  <th className="text-base px-4 py-3 text-right">Type</th>
                  <th className="text-base px-4 py-3 text-right">Strike price</th>
                  <th className="text-base px-4 py-3 text-right">Quantity</th>
                  <th className="text-base px-4 py-3 text-right">Expiry</th>
                  <th className="text-base px-4 py-3 text-right">Premium (tokens)</th>
                  <th className="text-base px-4 py-3 text-right">Premium (USD)</th>
                </tr>
              </thead>
              <tbody>
                {getUserAccount.data?.options
                  .filter(o => isIinitialized(o))
                  .map((o) => {
                  const market = allMarkets.find(r => r.account.id === o.marketIx)?.account;
                  const marketMint = market?.assetMint?.toBase58();
                  return (
                    // <tr key={o.account.id} className="hover:bg-base-200 border-b border-base-300">
                    <tr className="hover:bg-base-200 border-b border-base-300">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                            {market?.name.charAt(0)}
                          </div>
                          <span>{market?.name}</span>
                        </div>
                      </td>
                      {/* <td className="px-4 py-3 text-right">{market?.name}</td> */}
                      <td className="px-4 py-3 text-right">{o.optionType === 1 ? "CALL" : "PUT"}</td>
                      <td className="px-4 py-3 text-right">${descaleUsdPrice(o.strikePrice)}</td>
                      <td className="px-4 py-3 text-right">{o.quantity.toNumber()}</td>
                      <td className="px-4 py-3 text-right">{formatSolanaTimestamp(o.expiry)}</td>
                      <td className="px-4 py-3 text-right">{o.premium.toNumber()}</td>
                      <td className="px-4 py-3 text-right">${tokensToMoney(o.premium, marketMint, market?.assetDecimals, prices, 2)}</td>       
                      <td><button 
                        className="bg-transparent font-semibold py-2 px-4 border border-blue-900 text-blue-900 hover:shadow-md hover:text-blue-700 rounded-md"
                        onClick={() => onExercise(o.marketIx, o.ix, marketMint)} 
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
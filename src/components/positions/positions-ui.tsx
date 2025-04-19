import { PublicKey } from '@solana/web3.js';
import { optionsProgram } from './positions-data-access'
import { BN } from '@coral-xyz/anchor';


export function PositionsList({ account }: { account: PublicKey }) {
    const { getUserAccount } = optionsProgram({ account });
    console.log('sss', getUserAccount.data);

    const formatNumber = (value: number | BN, decimals: number = 0) => {
        const numValue = BN.isBN(value) ? value.toNumber() : value;
        return new Intl.NumberFormat('en-US', {
          maximumFractionDigits: decimals,
          minimumFractionDigits: decimals,
        }).format(numValue);
      };

    const descaleUsdPrice = (value: number | BN) => {
      const numValue = BN.isBN(value) ? value.toNumber() : value;
      const tvl = (numValue / Math.pow(10, 6));
      return formatNumber(tvl, 2);
    }

    const formatSolanaTimestamp = (expiry: BN) => {
        const exp = expiry.toNumber();
        console.log('exp', exp);

        if (!expiry || exp == 0) 
            return '';

        const millis = exp * 1000; // Convert seconds to milliseconds
        const date = new Date(millis);
        return date.toLocaleString(); // Local time representation
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
                  <th className="text-base px-4 py-3 text-right">Type</th>
                  <th className="text-base px-4 py-3 text-right">Strike price</th>
                  <th className="text-base px-4 py-3 text-right">Quantity</th>
                  <th className="text-base px-4 py-3 text-right">Expiry</th>
                  <th className="text-base px-4 py-3 text-right">Premium paid</th>
                </tr>
              </thead>
              <tbody>
                {getUserAccount.data?.options.map((o) => {
                  // console.log('market: ', m.account.name)
                  // console.log('market: ', m.account.assetDecimals)
                  // console.log('market: ', m.account.reserveSupply.toString())
                  // console.log('market: ', m.account.committedReserve.toString())
                  // console.log('market: ', m.account.lpMinted.toString())
                //   console.log('market: ', o.account.premiums.toString())
                  return (
                    // <tr key={o.account.id} className="hover:bg-base-200 border-b border-base-300">
                    <tr className="hover:bg-base-200 border-b border-base-300">
                      {/* <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                            {m.account.name.charAt(0)}
                          </div>
                          <span>{m.account.name}</span>
                        </div>
                      </td> */}
                      <td className="px-4 py-3 text-right">{o.marketIx}</td>
                      <td className="px-4 py-3 text-right">{o.optionType}</td>
                      <td className="px-4 py-3 text-right">${descaleUsdPrice(o.strikePrice)}</td>
                      <td className="px-4 py-3 text-right">{o.quantity.toNumber()}</td>
                      <td className="px-4 py-3 text-right">{formatSolanaTimestamp(o.expiry)}</td>
                      <td className="px-4 py-3 text-right">{o.premium.toNumber()}</td>

                      <td><button 
                        className="bg-transparent font-semibold py-2 px-4 border border-blue-900 text-blue-900 hover:shadow-md hover:text-blue-700 rounded-md"
                        onClick={() => {}}
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
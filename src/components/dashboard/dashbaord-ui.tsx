import { BN } from '@coral-xyz/anchor';
import { optionsProgram } from './dashbaord-data-access'
import { Link } from 'react-router';

// export interface Market {
//     id: number;
//     name: string;
//     fee_bps: number;
//     reserve_supply: number;
//     committed_reserve: number;
//     premiums: number;
//     lp_minted: number;
//     volatility_bps: number;
//     asset_decimals: number;
//   }

export interface Market {
    id: number;
    name: string;
    feeBps: BN;  // Note: using BN (Big Number) instead of number
    reserveSupply: BN;
    committedReserve: BN;
    premiums: BN;
    lpMinted: BN;
    volatilityBps: number;
    priceFeed: string; // New field not in your original struct
    assetDecimals: number;
  }


  export function MarketList({ onDeposit, onBuy }: {onDeposit: (m: any) => void; onBuy: (m: any) => void;}) {
    const { markets, getProgramAccount } = optionsProgram();
    
    if (getProgramAccount.isLoading) {
      return <span className="loading loading-spinner loading-lg"></span>;
    }
    
    if (!getProgramAccount.data?.value) {
      return (
        <div className="alert alert-info flex justify-center">
          <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
        </div>
      );
    }
  
    // Format number with commas and decimal places
    const formatNumber = (value: number | BN, decimals: number = 0) => {
      const numValue = BN.isBN(value) ? value.toNumber() : value;
      return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      }).format(numValue);
    };
  
    // Convert basis points to percentage
    const bpsToPercent = (bps: number | BN) => {
      const numValue = BN.isBN(bps) ? bps.toNumber() : bps;
      return (numValue / 100).toFixed(2) + '%';
    };
  
    // Format token amounts based on decimals
    const formatTokenAmount = (amount: BN, decimals: number) => {
      const numValue = amount.toNumber() / Math.pow(10, decimals);
      return formatNumber(numValue, 2);
    };
  
    return (
      <div className="space-y-6">
        {markets.isLoading ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : markets.data?.length ? (
          <div className="">
          {/* <div className="overflow-x-auto"> */}
            <table className="table w-full">
              <thead>
                <tr className="bg-base-300">
                  <th className="px-4 py-3">Market</th>
                  <th className="px-4 py-3 text-right">ID</th>
                  <th className="px-4 py-3 text-right">Fee</th>
                  <th className="px-4 py-3 text-right">Volatility</th>
                  <th className="px-4 py-3 text-right">Reserve Supply</th>
                  <th className="px-4 py-3 text-right">Committed</th>
                  <th className="px-4 py-3 text-right">Premiums</th>
                  <th className="px-4 py-3 text-right">LP Tokens</th>
                </tr>
              </thead>
              <tbody>
                {markets.data?.map((m) => (
                  <tr key={m.account.id} className="hover:bg-base-200 border-b border-base-300">
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                          {m.account.name.charAt(0)}
                        </div>
                        <span>{m.account.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">{m.account.id}</td>
                    <td className="px-4 py-3 text-right">{bpsToPercent(m.account.feeBps)}</td>
                    <td className="px-4 py-3 text-right">{bpsToPercent(m.account.volatilityBps)}</td>
                    <td className="px-4 py-3 text-right">{formatTokenAmount(m.account.reserveSupply, m.account.assetDecimals)}</td>
                    <td className="px-4 py-3 text-right">{formatTokenAmount(m.account.committedReserve, m.account.assetDecimals)}</td>
                    <td className="px-4 py-3 text-right">{formatTokenAmount(m.account.premiums, m.account.assetDecimals)}</td>
                    <td className="px-4 py-3 text-right">{formatTokenAmount(m.account.lpMinted, m.account.assetDecimals)}</td>
                    <td><button 
                      className="bg-transparent font-semibold py-2 px-4 border border-blue-900 text-blue-900 hover:shadow-md hover:text-blue-700 rounded-md"
                      onClick={() => {

                      }}
                      >Buy Option</button></td>
                    <td>
                        <button 
                          className="bg-blue-700 hover:bg-blue-800 hover:shadow-md font-semibold py-2 px-8 text-white rounded-md"
                          onClick={() => onDeposit(m)}
                        >Deposit</button>
                    </td>
                  </tr>
                ))}
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
    );
  }

// export function MarketList() {
//     const { markets, getProgramAccount } = optionsProgram()
    
//     if (getProgramAccount.isLoading) {
//         return <span className="loading loading-spinner loading-lg"></span>
//       }
//       if (!getProgramAccount.data?.value) {
//         return (
//           <div className="alert alert-info flex justify-center">
//             <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
//           </div>
//         )
//       }

//       return (
//         <div className={'space-y-6'}>
//             {markets.isLoading ? (
//             <span className="loading loading-spinner loading-lg"></span>
//             ) : 
//             markets.data?.length ? (
//                 <div className="grid md:grid-cols-2 gap-4">
//                         {markets.data?.map((m) => (
//                              <MarketCard key={m.account.id} market={m.account} />
//                         ))}
//                 </div>
//             ) : (
//               <div className="text-center">
//                 <h2 className={'text-2xl'}>No accounts</h2>
//                 No markets found. Create one above to get started.
//               </div>
//             )}
//         </div>
//       )
// }

// function MarketCard({ market }: { market: Market }) {
//     // Format number with commas and decimal places
//     const formatNumber = (value: number, decimals: number = 0) => {
//       return new Intl.NumberFormat('en-US', {
//         maximumFractionDigits: decimals,
//         minimumFractionDigits: decimals,
//       }).format(value);
//     };
  
//     // Convert basis points to percentage
//     const bpsToPercent = (bps: number) => {
//       return (bps / 100).toFixed(2) + '%';
//     };
  
//     // Format token amounts based on decimals
//     const formatTokenAmount = (amount: number, decimals: number) => {
//       return formatNumber(amount / Math.pow(10, decimals), decimals);
//     };
  
//     return (
//       <div className="card bg-base-200 shadow-xl">
//         <div className="card-body">
//           <div className="flex justify-between items-center">
//             <h2 className="card-title">{market.name}</h2>
//             <span className="badge badge-primary">ID: {market.id}</span>
//           </div>
          
//           <div className="divider my-2"></div>
          
//           <div className="grid grid-cols-2 gap-2">
//             <div className="stat p-2">
//               <div className="stat-title text-xs">Fee</div>
//               <div className="stat-value text-lg">{bpsToPercent(market.feeBps)}</div>
//             </div>
            
//             <div className="stat p-2">
//               <div className="stat-title text-xs">Volatility</div>
//               <div className="stat-value text-lg">{bpsToPercent(market.volatilityBps)}</div>
//             </div>
            
//             <div className="stat p-2">
//               <div className="stat-title text-xs">Reserve Supply</div>
//               <div className="stat-value text-lg">{formatTokenAmount(market.reserveSupply, market.assetDecimals)}</div>
//             </div>
            
//             <div className="stat p-2">
//               <div className="stat-title text-xs">Committed Reserve</div>
//               <div className="stat-value text-lg">{formatTokenAmount(market.committedReserve, market.assetDecimals)}</div>
//             </div>
            
//             <div className="stat p-2">
//               <div className="stat-title text-xs">Premiums</div>
//               <div className="stat-value text-lg">{formatTokenAmount(market.premiums, market.assetDecimals)}</div>
//             </div>
            
//             <div className="stat p-2">
//               <div className="stat-title text-xs">LP Tokens</div>
//               <div className="stat-value text-lg">{formatTokenAmount(market.lpMinted, market.assetDecimals)}</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }
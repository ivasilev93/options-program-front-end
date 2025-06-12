import { BN, ProgramAccount } from '@coral-xyz/anchor';
import { formatNumber, tokensToMoney, fetchTokenData } from '@/app/common/token-manager';
import { useEffect, useState } from 'react';
import { TokenInfo } from '@/app/common/market-context';
import { MarketAccount, rpcCalls } from '@/app/common/web3';

function parseMarket(market: ProgramAccount): MarketAccount {
  return {
    id: market.account.id,
    name: market.account.name,
    feeBps: market.account.feeBps.toNumber(),
    reserveSupply: market.account.reserveSupply.toNumber(),
    committedReserve: market.account.committedReserve.toNumber(),
    premiums: market.account.premiums.toNumber(),
    lpMinted: market.account.lpMinted.toNumber(),
    priceFeed: market.account.priceFeed,
    assetDecimals: market.account.assetDecimals,
    assetMint: market.account.assetMint.toBase58(),
    hour1VolatilityBps: market.account.hour1VolatilityBps,
    hour4VolatilityBps: market.account.hour4VolatilityBps,
    day1VolatilityBps: market.account.day1VolatilityBps,
    day3VolatilityBps: market.account.day3VolatilityBps,
    weekVolatilityBps: market.account.weekVolatilityBps,
    volLastUpdated: market.account.volLastUpdated,
  }
}

  export function MarketList({ onDeposit, onBuy }: {onDeposit: (m: any, tokenData: TokenInfo) => void; onBuy: (m: any, tokenData: TokenInfo) => void;}) {
    const { getProgramAccount, fetchMarkets } = rpcCalls();
    const [ programAccount, setProgramAccount ] = useState<any>(null);
    const [ programAccountLoading, setProgramAccountLoading ] = useState(true);
    const [ markets, setMarkets ] = useState<ProgramAccount[]>([]);
    const [ marketsLoading, setMarketsLoading ] = useState(true);
    const [ tokenDataLoaded, setTokenDataLoaded ] = useState(false);
    const [ tokenData, setTokenData ] = useState<Record<string, TokenInfo>>({});

    //Load program account and markets
    useEffect(() => {
      const fetchProgramAccount = async () => {
        setProgramAccountLoading(true);
        try {
          const accInfo = await getProgramAccount();
          // console.log('program account: ', accInfo)
          setProgramAccount(accInfo);
        } catch (err) {

        } finally {
          setProgramAccountLoading(false);
        }
      };

      const fetchAllMarkets = async () => {
        setMarketsLoading(true);
        try {
          const marketData = await fetchMarkets();

          setMarkets(marketData);
          //set global markets...
        } catch (err) {
          console.error('Error fetching markets:', err);
        } finally {
          setMarketsLoading(false);
        }
      }

      fetchProgramAccount();
      fetchAllMarkets();
    }, [])

    //Load token metadata for markets
    useEffect(() => {
      if(markets.length <= 0) { return };
      const mintAddresses = markets.map((m) => m.account.assetMint.toBase58());

      const fetchTokens = async () => {
        try {
          const tokenData = await fetchTokenData(mintAddresses);
          setTokenData(tokenData);

          setTokenDataLoaded(true);
        } catch (err) {
          console.error('Error fetching token data:', err);
        }
      }
      
      fetchTokens();
    }, [markets])
    
    if (programAccountLoading ) {
      return <span className="loading loading-spinner loading-lg"></span>;
    }
    
    if (!programAccount) {
      return (
        <div className="alert alert-info flex justify-center">
          <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
        </div>
      );
    }
  
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
      <div className="container mx-auto px-4 py-6 max-w-7xl">        
        <div className="bg-white rounded-xl">
          <div className="bg-white px-6 py-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-sky-400 bg-clip-text text-transparent">
              Available Markets
            </h1>
            <p className="text-lg text-gray-600 opacity-80 mt-2">
              Interact with on-chain markets featuring dynamic pricing and custom terms
            </p>
          </div>
  
          
          <div className="p-4">
          <div className="space-y-6">
        {marketsLoading ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : markets.length && tokenDataLoaded ? (
          <div className="">
          {/* <div className="overflow-x-auto"> */}
            <table className="table w-ful">
              <thead>
                <tr className="bg-white">
                  <th className="text-base px-4 py-3">Market</th>
                  <th className="text-base px-4 py-3 text-right">ID</th>
                  <th className="text-base px-4 py-3 text-right">Fee</th>
                  {/* <th className="text-base px-4 py-3 text-right">Volatility</th> */}
                  <th className="text-base px-4 py-3 text-right">TVL</th>
                  <th className="text-base px-4 py-3 text-right">Committed</th>
                  <th className="text-base px-4 py-3 text-right">Premiums</th>
                  <th className="text-base px-4 py-3 text-right">LP Tokens</th>
                </tr>
              </thead>
              <tbody>
                {
                markets.map((m) => {
                  return (
                    <tr key={m.account.id} className="hover:bg-base-200 border-b border-base-300">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-gray-300">
                            <img
                              src={tokenData[m.account.assetMint.toBase58()]?.logoUrl}
                              alt={tokenData[m.account.assetMint.toBase58()]?.symbol}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span>{tokenData[m.account.assetMint.toBase58()]?.symbol}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">{m.account.id}</td>
                      <td className="px-4 py-3 text-right">{bpsToPercent(m.account.feeBps)}</td>
                      {/* <td className="px-4 py-3 text-right">{bpsToPercent(m.account.volatilityBps)}</td> */}
                      <td className="px-4 py-3 text-right">${tokensToMoney(m.account.reserveSupply.toString(), m.account.assetDecimals, tokenData[m.account.assetMint.toBase58()].price, 2)}</td>
                      {/* <td className="px-4 py-3 text-right">{formatTokenAmount(m.account.reserveSupply, m.account.assetDecimals)}</td> */}
                      <td className="px-4 py-3 text-right">${tokensToMoney(m.account.committedReserve.toString(), m.account.assetDecimals, tokenData[m.account.assetMint.toBase58()].price, 2)}</td>
                      <td className="px-4 py-3 text-right">${tokensToMoney(m.account.premiums, m.account.assetDecimals, tokenData[m.account.assetMint.toBase58()].price, 2)}</td>
                      {/* <td className="px-4 py-3 text-right">{formatTokenAmount(m.account.premiums, m.account.assetDecimals)}</td> */}
                      <td className="px-4 py-3 text-right">{formatTokenAmount(m.account.lpMinted, m.account.assetDecimals)}</td>
                      <td><button 
                        className="bg-transparent font-semibold py-2 px-4 border border-blue-900 text-blue-900 hover:shadow-md hover:text-blue-700 rounded-md"
                        onClick={() => onBuy(parseMarket(m), tokenData[m.account.assetMint.toBase58()])}
                        >Buy Option</button></td>
                      <td>
                          <button 
                            className="bg-blue-700 hover:bg-blue-800 hover:shadow-md font-semibold py-2 px-8 text-white rounded-md"
                            onClick={() => onDeposit(parseMarket(m), tokenData[m.account.assetMint.toBase58()])}
                          >Liquidity</button>
                      </td>
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
    );
  }

   
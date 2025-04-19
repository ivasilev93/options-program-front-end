import { BN, ProgramAccount } from '@coral-xyz/anchor';
import { optionsProgram } from './dashbaord-data-access'
import { Link } from 'react-router';
import { getTokenPrice } from '@/app/common/token-manager';
import { useEffect, useState } from 'react';

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
    const [prices, setPrices] = useState<Record<string, number>>({});

    useEffect(() => {
      const fetchPrices = async () => {
        if (!markets.data) return;
  
        const mintAddresses = markets.data.map((m) => m.account.assetMint.toBase58());
  
        const priceResults = await Promise.all(
          mintAddresses.map((mint) =>
            getTokenPrice(mint)
              .then((price) => ({ mint, price }))
              .catch(() => ({ mint, price: 0 })) // fallback on failure
          )
        );
  
        const priceMap: Record<string, number> = {};
        for (const { mint, price } of priceResults) {
          priceMap[mint] = price;
        }
  
        setPrices(priceMap);
      };
  
      fetchPrices();
    }, [markets.data]);
    
    if (getProgramAccount.isLoading ) {
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

    const tokensToMoney = (value: number | BN, assetMint: string, decimals: number) => {
      const numValue = BN.isBN(value) ? value.toNumber() : value;
      const price = prices[assetMint] ?? null;
      const tvl = (numValue / Math.pow(10, decimals)) * price;
      return formatNumber(tvl, 0);
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
        {markets.isLoading ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : markets.data?.length ? (
          <div className="">
          {/* <div className="overflow-x-auto"> */}
            <table className="table w-ful">
              <thead>
                <tr className="bg-white">
                  <th className="text-base px-4 py-3">Market</th>
                  <th className="text-base px-4 py-3 text-right">ID</th>
                  <th className="text-base px-4 py-3 text-right">Fee</th>
                  <th className="text-base px-4 py-3 text-right">Volatility</th>
                  <th className="text-base px-4 py-3 text-right">Reserve Supply</th>
                  <th className="text-base px-4 py-3 text-right">Committed</th>
                  <th className="text-base px-4 py-3 text-right">Premiums</th>
                  <th className="text-base px-4 py-3 text-right">LP Tokens</th>
                </tr>
              </thead>
              <tbody>
                {markets.data?.map((m) => {
                  // console.log('market: ', m.account.name)
                  // console.log('market: ', m.account.assetDecimals)
                  // console.log('market: ', m.account.reserveSupply.toString())
                  // console.log('market: ', m.account.committedReserve.toString())
                  // console.log('market: ', m.account.lpMinted.toString())
                  console.log('market: ', m.account.premiums.toString())
                  return (
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
                      <td className="px-4 py-3 text-right">${tokensToMoney(m.account.reserveSupply.toString(), m.account.assetMint.toBase58(), m.account.assetDecimals)}</td>
                      {/* <td className="px-4 py-3 text-right">{formatTokenAmount(m.account.reserveSupply, m.account.assetDecimals)}</td> */}
                      <td className="px-4 py-3 text-right">{formatTokenAmount(m.account.committedReserve, m.account.assetDecimals)}</td>
                      <td className="px-4 py-3 text-right">${tokensToMoney(m.account.premiums, m.account.assetMint.toBase58(), m.account.assetDecimals)}</td>
                      {/* <td className="px-4 py-3 text-right">{formatTokenAmount(m.account.premiums, m.account.assetDecimals)}</td> */}
                      <td className="px-4 py-3 text-right">{formatTokenAmount(m.account.lpMinted, m.account.assetDecimals)}</td>
                      <td><button 
                        className="bg-transparent font-semibold py-2 px-4 border border-blue-900 text-blue-900 hover:shadow-md hover:text-blue-700 rounded-md"
                        onClick={() => onBuy(m)}
                        >Buy Option</button></td>
                      <td>
                          <button 
                            className="bg-blue-700 hover:bg-blue-800 hover:shadow-md font-semibold py-2 px-8 text-white rounded-md"
                            onClick={() => onDeposit(m)}
                          >Deposit</button>
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

   
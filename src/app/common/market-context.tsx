import { BN, ProgramAccount } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getTokenMetadata, getTokenPrice } from './token-manager';

// Define the market interface
// export interface Market {
//   id: string;
//   name: string;
//   assetMint: string;
//   marketIx: string;
//   price: number;
// }

export type TokenInfo = {
  mint: string;
  price: number,
  logoUrl: string,
  symbol: string
  // lastUpdated: number;
};

type MarketAccount = {
  id: number;
  name: string;
  feeBps: BN;
  bump: number;
  reserveSupply: BN;
  committedReserve: BN;
  premiums: BN;
  lpMinted: BN;
  priceFeed: string;
  assetDecimals: number;
  assetMint: PublicKey;
  hour1VolatilityBps: number;
  hour4VolatilityBps: number;
  day1VolatilityBps: number;
  day3VolatilityBps: number;
  weekVolatilityBps: number;
  volLastUpdated: number;
};

interface MarketContextType {
  selectedMarket: ProgramAccount<MarketAccount> | null;
  setSelectedMarket: (market: ProgramAccount<MarketAccount> | null) => void;
  allMarkets: ProgramAccount<any>[]; // All markets
  setMarkets: (markets: ProgramAccount<any>[] | []) => void;
  tokenData: Record<string, TokenInfo>;
  // refreshTokenData: () => void;
  // setTokenInfo: (prices: TokenInfo[] | []) => void;

}

const MarketContext = createContext<MarketContextType>({
  selectedMarket: null,
  setSelectedMarket: () => {},
  allMarkets: [],
  setMarkets: () => [],
  tokenData: {},
  // refreshTokenData: () => {},
  // setTokenInfo: () => [],
});

interface MarketProviderProps {
  children: ReactNode;
}

export function MarketProvider({ children }: MarketProviderProps) {
  const [selectedMarket, setSelectedMarket] = useState<ProgramAccount<MarketAccount> | null>(null);
  const [allMarkets, setMarkets] = useState<ProgramAccount<MarketAccount>[]>([]);
  const [tokenData, setTokenData] = useState<Record<string, TokenInfo>>({});
  
//   const fetchTokenData = async () => {
//     console.log('fetching token data...');
//     if (!allMarkets || allMarkets.length === 0) {
//       console.log('returning...');
//       return;
//     }

//     const mints = allMarkets.map((m) => m.account.assetMint.toBase58());
//     const updatedData: Record<string, TokenInfo> = {};

//     await Promise.all(
//       mints.map(async (mint) => {
//         const [price, metadata] = await Promise.all([
//           getTokenPrice(mint),
//           getTokenMetadata(mint),
//         ]);
//         updatedData[mint] = {
//           mint,
//           price,
//           logoUrl: metadata?.logoURI || '',
//           symbol: metadata?.symbol || 'N/A',
//         };
//       })
//     );

//     console.log('updatedData: ', updatedData);

//     // Only update state if data has changed
//     if (JSON.stringify(updatedData) !== JSON.stringify(tokenData)) {
//       setTokenData(updatedData);
//     }
//   };

//   useEffect(() => {
//     if (allMarkets.length === 0) return;

//     fetchTokenData();
//     const interval = setInterval(fetchTokenData, 3000); // Update every 2 seconds
//     return () => clearInterval(interval);
//   }
//   , [allMarkets]
// );

  return (
    <MarketContext.Provider value={{ selectedMarket, setSelectedMarket, allMarkets, setMarkets, tokenData }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  return useContext(MarketContext);
}
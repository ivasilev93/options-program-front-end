import { BN, ProgramAccount } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define the market interface
// export interface Market {
//   id: string;
//   name: string;
//   assetMint: string;
//   marketIx: string;
//   price: number;
// }

export type PriceFeed = {
  mint: string;
  price: number
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
  volatilityBps: number;
  priceFeed: string;
  assetDecimals: number;
  assetMint: PublicKey;
};

interface MarketContextType {
  selectedMarket: ProgramAccount<MarketAccount> | null;
  setSelectedMarket: (market: ProgramAccount<MarketAccount> | null) => void;
  allMarkets: ProgramAccount<any>[]; // All markets
  setMarkets: (markets: ProgramAccount<any>[] | []) => void;
  prices: PriceFeed[]; // All markets
  setPrices: (prices: PriceFeed[] | []) => void;
  // priceFeeds: Record<string, PriceFeed>;
  // refreshPriceFeed: (mintAddress: string) => Promise<void>;
  // getPrice: (mintAddress: string) => number | undefined;

}

const MarketContext = createContext<MarketContextType>({
  selectedMarket: null,
  setSelectedMarket: () => {},
  allMarkets: [],
  setMarkets: () => [],
  prices: [],
  setPrices: () => [],
  // priceFeeds: {},
  // refreshPriceFeed: async () => {},
  // getPrice: () => undefined
});

interface MarketProviderProps {
  children: ReactNode;
}

export function MarketProvider({ children }: MarketProviderProps) {
  const [selectedMarket, setSelectedMarket] = useState<ProgramAccount<MarketAccount> | null>(null);
  const [allMarkets, setMarkets] = useState<ProgramAccount<MarketAccount>[]>([]);
  const [prices, setPrices] = useState<PriceFeed[]>([]);
  // const [priceFeeds, setPriceFeeds] = useState<Record<string, PriceFeed>>({});
  
  // useEffect(() => {

  // })

  return (
    <MarketContext.Provider value={{ selectedMarket, setSelectedMarket, allMarkets, setMarkets, prices, setPrices }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  return useContext(MarketContext);
}
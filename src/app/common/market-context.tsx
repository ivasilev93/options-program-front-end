import { BN, ProgramAccount } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { createContext, useContext, useState, ReactNode } from 'react';

// Define the market interface
export interface Market {
  id: string;
  name: string;
  assetMint: string;
  marketIx: string;
  price: number;
}

interface MarketContextType {
  selectedMarket: ProgramAccount<{
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
}> | null;
  setSelectedMarket: (market: ProgramAccount<{
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
}> | null) => void;
}

const MarketContext = createContext<MarketContextType>({
  selectedMarket: null,
  setSelectedMarket: () => {},
});

interface MarketProviderProps {
  children: ReactNode;
}

export function MarketProvider({ children }: MarketProviderProps) {
  const [selectedMarket, setSelectedMarket] = useState<ProgramAccount<{
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
}> | null>(null);
  
  return (
    <MarketContext.Provider value={{ selectedMarket, setSelectedMarket }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  return useContext(MarketContext);
}
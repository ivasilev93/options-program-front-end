import { useState } from 'react'
import { AppHero } from '../ui/ui-layout'
import {} from './dashbaord-ui'
import { Market, MarketList } from './dashbaord-ui'
// import { MarketDepositUIModal } from '../liquidity-providers/luquidity-providers-ui';
import { useNavigate } from 'react-router';
import { useMarket } from '@/app/common/market-context';
import { BN, ProgramAccount } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export default function DashboardFeature() {
  const navigate = useNavigate();
  const { setSelectedMarket } = useMarket();

  const handleDeposit = (m: ProgramAccount<{
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
}>) => {
    setSelectedMarket(m);
    navigate('/liquidity-providers')
  }

  const handleBuy = (m: ProgramAccount<{
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
}>) => {
    setSelectedMarket(m);
    navigate('/buy')
  }
 

  return (
    <div>
      <MarketList onDeposit={handleDeposit} onBuy={handleBuy}/>
    </div>
  )
}

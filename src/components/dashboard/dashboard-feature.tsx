import { useState } from 'react'
import { AppHero } from '../ui/ui-layout'
import {} from './dashbaord-ui'
import { MarketList } from './dashbaord-ui'
// import { MarketDepositUIModal } from '../liquidity-providers/luquidity-providers-ui';
import { useNavigate } from 'react-router';
import { TokenInfo } from '@/app/common/market-context';
import { MarketAccount } from '@/app/common/web3';

export default function DashboardFeature() {
  const navigate = useNavigate();
  
  const handleDeposit = (m: MarketAccount, tokenInfo: TokenInfo) => {
    navigate('/liquidity-providers', { state: { selectedMarket: m, tokenData: tokenInfo } })
  }

  const handleBuy = (m: MarketAccount, tokenInfo: TokenInfo) => {
    navigate('/buy', { state: { selectedMarket: m, tokenData: tokenInfo } })
  } 

  return (
    <div>
      <MarketList onDeposit={handleDeposit} onBuy={handleBuy}/>
    </div>
  )
}

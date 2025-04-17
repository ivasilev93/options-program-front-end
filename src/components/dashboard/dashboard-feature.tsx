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
    console.log('wtf: ', m)
    setSelectedMarket(m);
    navigate('/liquidity-providers')
  }
 

  return (
    // <div>
    //   <AppHero title="gm" subtitle="Say hi to your new Solana dApp." />
    //   <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center">
    //     <div className="space-y-2">
    //       <p>Here are some helpful links to get you started.</p>
    //       {links.map((link, index) => (
    //         <div key={index}>
    //           <a href={link.href} className="link" target="_blank" rel="noopener noreferrer">
    //             {link.label}
    //           </a>
    //         </div>
    //       ))}
    //     </div>
    //   </div>
    // </div>

    <div>
      <MarketList onDeposit={handleDeposit} onBuy={() => {}}/>
    </div>
  )
}

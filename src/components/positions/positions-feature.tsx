import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { PositionsList } from "./positions-ui";


export default function PositionFeature() {
    const { publicKey } = useWallet();

   return publicKey ? (
    <div>
      <PositionsList account={publicKey} />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  )
}
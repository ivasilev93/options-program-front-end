import  OptionsProgramIDL  from '../contract/options_program.json'
import type { OptionsProgram } from '../contract/options_program'
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'

export { OptionsProgram, OptionsProgramIDL }

// The programId is imported from the program IDL.
export const OPTIONS_PROGRAM_ID = new PublicKey(OptionsProgramIDL.address)

// This is a helper function to get the Rentalescrow Anchor program.
export function getOptionsProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...OptionsProgramIDL, address: address ? address.toBase58() : OptionsProgramIDL.address } as OptionsProgram, provider)
}

// This is a helper function to get the program ID for the Rentalescrow program depending on the cluster.
export function getOptionsProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Options program on devnet and testnet.
      return new PublicKey('3ZWb72v75w19dvHjwsqxe6gdK3yvU6p645PPEFpCSzHg')
    case 'mainnet-beta':
    default:
      return OPTIONS_PROGRAM_ID
  }
}
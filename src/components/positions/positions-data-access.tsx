import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createSyncNativeInstruction, getAssociatedTokenAddress, NATIVE_MINT, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { getOptionsProgram, getOptionsProgramId } from '../../contract/options-program-exports'
import {
    Cluster,
  PublicKey,
} from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function optionsProgram({ account }: { account: PublicKey }) {
    const { cluster } = useCluster()
    const provider = useAnchorProvider()
    const programId = useMemo(() => getOptionsProgramId(cluster.network as Cluster), [cluster])
    const program = useMemo(() => getOptionsProgram(provider, programId), [provider, programId])
    const transactionToast = useTransactionToast()

    const getUserAccount = useQuery({
        queryKey: [ 'userOptionsAccount', { cluster, account }],
        queryFn: async () => {

            const [userAcc] = PublicKey.findProgramAddressSync(
                [
                  Buffer.from("account"),
                  Buffer.from(account.toBuffer())
                ],
                program.programId
            );     

            const userAccData = await program.account.userAccount.fetch(userAcc);
            return userAccData;
        }
    })

    const exercise = useMutation({
      mutationKey: ['position', 'exercise', { cluster }],
      mutationFn: async (input: {
          marketIx: number,
          optionIx: number,
          mint: string
      }) => {
          const { marketIx, optionIx, mint } = input;
          const signer = provider.wallet.publicKey;
          const mintAddr = new PublicKey(mint);
          console.log( marketIx, optionIx, mint)

          const user_asset_ata: PublicKey = await getAssociatedTokenAddress(mintAddr, signer, false);           
          const solUsdPythAddr = new PublicKey('7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE');  

            const [market] = PublicKey.findProgramAddressSync(
              [
                Buffer.from("market"),
                Buffer.from(new Uint8Array(new Uint16Array([marketIx]).buffer))
              ],
              program.programId
            );
            
            const [marketVault] = PublicKey.findProgramAddressSync(
              [
                Buffer.from("market_vault"),
                Buffer.from(new Uint8Array(new Uint16Array([marketIx]).buffer))
              ],
              program.programId
            );

            const [userAcc] = PublicKey.findProgramAddressSync(
              [
                Buffer.from("account"),
                Buffer.from(signer.toBuffer())
              ],
              program.programId
          );      

          const exerciseSign = await program.methods
          .exercise(marketIx, optionIx)
          .accountsStrict({
              signer: signer,
              account: userAcc,
              userTokenAcc: user_asset_ata,
              market: market,
              marketVault: marketVault,
              assetMint: mint,
              priceUpdate: solUsdPythAddr,
              tokenProgram:TOKEN_PROGRAM_ID
          }).rpc();   

          return exerciseSign;
      },
      onSuccess: (signature) => {
          console.log('Exercise signature: ', signature)
          transactionToast(signature)
      },
      onError: () => toast.error('Failed')
  })
  
      return {
        getUserAccount,
        exercise
      }
}

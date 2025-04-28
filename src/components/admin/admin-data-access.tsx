import { getOptionsProgram, getOptionsProgramId } from '../../contract/options-program-exports'
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, NATIVE_MINT, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
    Cluster,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
  TransactionSignature,
  VersionedTransaction,
} from '@solana/web3.js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTransactionToast } from '../ui/ui-layout'

import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { BN } from '@coral-xyz/anchor'
// import { publicKey } from '@coral-xyz/anchor/dist/cjs/utils'

export function optionsProgram() {
    const { connection } = useConnection()
    const { cluster } = useCluster()
    const transactionToast = useTransactionToast()
    const provider = useAnchorProvider()
    const programId = useMemo(() => getOptionsProgramId(cluster.network as Cluster), [cluster])
    const program = useMemo(() => getOptionsProgram(provider, programId), [provider, programId])

    const createMarket = useMutation({
        mutationKey: ['market', 'create', { cluster }],
        mutationFn: async (input: {
            fee: number,
            name: string,
            ix: number,
            priceFeed: string,
            volatility: number,
            mint: string
        }) => {
            const signer = provider.wallet.publicKey;
            const { fee, name, ix, priceFeed, volatility, mint } = input;
            
            const adminwSolAcc: PublicKey = await getAssociatedTokenAddress(new PublicKey(mint), signer, false);
            const accInfo = await connection.getAccountInfo(adminwSolAcc);

            let transaction = new Transaction();

            if (!accInfo) {
                console.log('Adding Create ATA Ix...')
      
                transaction.add(
                  createAssociatedTokenAccountInstruction(
                    signer,
                    adminwSolAcc,
                    signer,
                    NATIVE_MINT,
                  )
                );
              }      

              const [lpMint] = PublicKey.findProgramAddressSync(
                [
                  Buffer.from("market_lp_mint"),
                  Buffer.from(new Uint8Array(new Uint16Array([ix]).buffer))
                ],
                program.programId
              );

              const [market] = PublicKey.findProgramAddressSync(
                [
                  Buffer.from("market"),
                  Buffer.from(new Uint8Array(new Uint16Array([ix]).buffer))
                ],
                program.programId
              );
              
              const [marketVault] = PublicKey.findProgramAddressSync(
                [
                  Buffer.from("market_vault"),
                  Buffer.from(new Uint8Array(new Uint16Array([ix]).buffer))
                ],
                program.programId
              );
              
              const [protocolFeesVault] = PublicKey.findProgramAddressSync(
                [
                  Buffer.from("protocol_fees_vault"),
                  Buffer.from(new Uint8Array(new Uint16Array([ix]).buffer))
                ],
                program.programId
              );

                // Call the program method
                const createMarketIx = await program.methods
                .createMarket({
                  fee: new BN(fee),
                  name: name,
                  ix: ix,
                  priceFeed: priceFeed,
                  volatilityBps: volatility
                })
                .accountsStrict({
                  signer: signer,
                  assetMint: mint,
                  lpMint: lpMint,
                  market: market,
                  marketVault: marketVault,
                  protocolFeesVault: protocolFeesVault,
                  tokenProgram: TOKEN_PROGRAM_ID,
                  systemProgram: SystemProgram.programId
                })
                .instruction();

                transaction.add(createMarketIx); 
                const createSignature = await provider.sendAndConfirm(transaction);
            

            return createSignature;
        },
        onSuccess: (signature) => {
            transactionToast(signature)
        },
        onError: () => toast.error('Failed')
    })

      return {
        program,
        programId,
        createMarket
      }
}
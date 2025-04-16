import { getOptionsProgram, getOptionsProgramId } from '../../contract/options-program-exports'
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, NATIVE_MINT, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
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

export function optionsProgram() {
    const { connection } = useConnection()
    const { cluster } = useCluster()
    const transactionToast = useTransactionToast()
    const provider = useAnchorProvider()
    const programId = useMemo(() => getOptionsProgramId(cluster.network as Cluster), [cluster])
    const program = useMemo(() => getOptionsProgram(provider, programId), [provider, programId])

    const depositMarket = useMutation({
        mutationKey: ['market', 'deposit', { cluster }],
        mutationFn: async (input: {
            amount: number,
            min_amount_out: number,
            ix: number,
            mint: string
        }) => {
            const { amount, min_amount_out, ix, mint } = input;
            const signer = provider.wallet.publicKey;

            const user_asset_ata: PublicKey = await getAssociatedTokenAddress(new PublicKey(mint), signer, false);
            const accInfo = await connection.getAccountInfo(user_asset_ata);

            let transaction = new Transaction();

            if (!accInfo) {
                console.log('Creating ATA Ix for market asset...')      
                transaction.add(
                    createAssociatedTokenAccountInstruction(
                      signer,
                      user_asset_ata,
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

            const user_lp_ata: PublicKey = await getAssociatedTokenAddress(lpMint, signer, false);


            const depositIx = await program.methods.marketDeposit(
                new BN(amount),
                new BN(min_amount_out),
                ix
            ).accountsStrict({
                signer: signer,
                userAssetAta: user_asset_ata,
                userLpAta: user_lp_ata,
                market: market,
                marketVault: marketVault,
                assetMint: mint,
                lpMint: lpMint,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                tokenProgram:TOKEN_PROGRAM_ID
            }).instruction();

            transaction.add(depositIx); 
            const createSignature = await provider.sendAndConfirm(transaction);        

            return createSignature;
        },
        onSuccess: (signature) => {
            console.log('Deposit signature: ', signature)
            transactionToast(signature)
        },
        onError: () => toast.error('Failed')
    })

    const withdrawMarket = useMutation({
        mutationKey: ['market', 'withdraw', { cluster }],
        mutationFn: async (input: {
            lp_tokens_to_burn: number,
            min_amount_out: number,
            ix: number,
            mint: string
        }) => {
            const { lp_tokens_to_burn, min_amount_out, ix, mint } = input;
            const signer = provider.wallet.publicKey;

            const user_asset_ata: PublicKey = await getAssociatedTokenAddress(new PublicKey(mint), signer, false);
            const accInfo = await connection.getAccountInfo(user_asset_ata);

            if (!accInfo) {
                console.log('User has no ATA not right...')
                throw Error("invalid state here.. user has no ata, but withdraws...")     
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

            const user_lp_ata: PublicKey = await getAssociatedTokenAddress(lpMint, signer, false);


            const withdrawSign = await program.methods.marketDeposit(
                new BN(lp_tokens_to_burn),
                new BN(min_amount_out),
                ix
            ).accountsStrict({
                signer: signer,
                userAssetAta: user_asset_ata,
                userLpAta: user_lp_ata,
                market: market,
                marketVault: marketVault,
                assetMint: mint,
                lpMint: lpMint,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                tokenProgram:TOKEN_PROGRAM_ID
            }).rpc();   

            return withdrawSign;
        },
        onSuccess: (signature) => {
            console.log('Withdraw signature: ', signature)
            transactionToast(signature)
        },
        onError: () => toast.error('Failed')
    })

    return {
        depositMarket,
        withdrawMarket
    }
}
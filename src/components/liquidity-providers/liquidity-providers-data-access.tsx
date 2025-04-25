import { getOptionsProgram, getOptionsProgramId } from '../../contract/options-program-exports'
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createSyncNativeInstruction, getAssociatedTokenAddress, NATIVE_MINT, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
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
import { checkUserTokenAmount, syncNativeTokenAmounts } from '../../app/common/token-manager';

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
            const mintAddr = new PublicKey(mint);

            const user_asset_ata: PublicKey = await getAssociatedTokenAddress(mintAddr, signer, false);
            let transaction = new Transaction();            

            const tokenDiff = await checkUserTokenAmount(mintAddr, signer, connection, amount);

            if (tokenDiff > 0) {
                if (mint == NATIVE_MINT.toBase58()) {
                    await syncNativeTokenAmounts(signer, connection, tokenDiff, transaction);
                }
                else {   
                   throw new Error('Not enough tokens')
                }   
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

            const payload = {
                amount: new BN(amount.toFixed(0)),
                minAmountOut: new BN(min_amount_out.toFixed(0)),
                ix: ix
            };

            const depositIx = await program.methods
            .marketDeposit(payload)
            .accountsStrict({
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
            mint: PublicKey
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

            console.log('check', {
              lpTokensToBurn: lp_tokens_to_burn,
              minAmountOut: min_amount_out,
              ix: ix});

            const withdrawSign = await program.methods.marketWithdraw({
                lpTokensToBurn: new BN(lp_tokens_to_burn),
                minAmountOut: new BN(min_amount_out),
                ix: ix}
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

    const getUserLpBalance = async (marketIx: number, userPubkey: string)  => {
        const [lpMint] = PublicKey.findProgramAddressSync(
            [
              Buffer.from("market_lp_mint"),
              Buffer.from(new Uint8Array(new Uint16Array([marketIx]).buffer))
            ],
            program.programId
          );

          const userTokenAddrr: PublicKey = await getAssociatedTokenAddress(lpMint, new PublicKey(userPubkey), false);
          const userTokenAccInfo = await connection.getAccountInfo(userTokenAddrr);
          if (!userTokenAccInfo) {
              return 0;
          }
        
          const tokenBalanceInfo = await connection.getTokenAccountBalance(userTokenAddrr);     
          // console.log('asd', tokenBalanceInfo);     
          // const tokenBalance = tokenBalanceInfo?.value.uiAmount || 0;
          return tokenBalanceInfo
        }
      

    return {
        depositMarket,
        withdrawMarket,
        getUserLpBalance
    }
}
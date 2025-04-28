import { getOptionsProgram, getOptionsProgramId } from '../../contract/options-program-exports'
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createSyncNativeInstruction, getAssociatedTokenAddress, getMint, NATIVE_MINT, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
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
import { publicKey } from '@coral-xyz/anchor/dist/cjs/utils'


export function optionsProgram() {
    const { connection } = useConnection()
    const { cluster } = useCluster()
    const transactionToast = useTransactionToast()
    const provider = useAnchorProvider()
    const programId = useMemo(() => getOptionsProgramId(cluster.network as Cluster), [cluster])
    const program = useMemo(() => getOptionsProgram(provider, programId), [provider, programId])

    const buyOption = useMutation({
        mutationKey: ['option', 'buy', { cluster }],
        mutationFn: async (input: {
            marketIx: number,
            option: string,
            strikePrice: number,
            expiryStamp: number,
            quantity: number,
            mint: string,
            estPremium: number,
        }) => {
            const { marketIx, option, strikePrice, expiryStamp, quantity, mint, estPremium } = input;
            const signer = provider.wallet.publicKey;
            const mintAddr = new PublicKey(mint);
            const solUsdPythAddr = new PublicKey('7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE');

            const user_asset_ata: PublicKey = await getAssociatedTokenAddress(mintAddr, signer, false);
            // const mintInfo = await getMint(connection, mintAddr, undefined, TOKEN_PROGRAM_ID);
            let transaction = new Transaction();
            const tokensRequired = estPremium * quantity;            

            console.log("estPremium", estPremium)

            const tokenDiff = await checkUserTokenAmount(mintAddr, signer, connection, tokensRequired + 1);
            console.log("tokenDiff", tokenDiff)

            if (tokenDiff > 0) {
                if (mint == NATIVE_MINT.toBase58()) {
                    console.log("syncing")

                    await syncNativeTokenAmounts(signer, connection, tokenDiff, transaction);
                }
                else {   
                   throw new Error('Not enough tokens')
                }   
            }           

            const [userAcc] = PublicKey.findProgramAddressSync(
                [
                  Buffer.from("account"),
                  Buffer.from(signer.toBuffer())
                ],
                program.programId
            );      

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

            const [protocolFeesVault] = PublicKey.findProgramAddressSync(
                [
                  Buffer.from("protocol_fees_vault"),
                  Buffer.from(new Uint8Array(new Uint16Array([marketIx]).buffer))
                ],
                program.programId
            );

            const payload = {
                marketIx: marketIx,
                option: option === "CALL" ? { call: {} } : { put: {} },
                strikePriceUsd: new BN(strikePrice),
                expiryStamp: new BN(expiryStamp),
                quantity: new BN(quantity)
                //slippage
            };

            console.log('payload', 
                {
                    marketIx: marketIx,
                    option: option === "CALL" ? { call: {} } : { put: {} },
                    strikePriceUsd: strikePrice,
                    expiryStamp: expiryStamp,
                    quantity: quantity
                }
            )

            //Add create acc ix if there is no user acc created
            const actualUserAcc = await program.account.userAccount.getAccountInfo(userAcc);
            if (!actualUserAcc) {
                transaction.add(
                    await program.methods
                    .createAccount()
                    .accountsStrict({
                        signer: signer,
                        account: userAcc,
                        systemProgram: SystemProgram.programId
                    }).instruction())
            }

            const depositIx = await program.methods
            .buy(payload)
            .accountsStrict({
                signer: signer,
                account: userAcc,
                userTokenAcc: user_asset_ata,                
                market: market,
                marketVault: marketVault,
                protocolFeesVault: protocolFeesVault,
                assetMint: mint,
                priceUpdate: solUsdPythAddr,
                tokenProgram:TOKEN_PROGRAM_ID
            }).instruction();

            transaction.add(depositIx); 
            const depositSignature = await provider.sendAndConfirm(transaction);        

            return depositSignature;
        },
        onSuccess: (signature) => {
            console.log('Deposit signature: ', signature)
            transactionToast(signature)
        },
        onError: () => toast.error('Failed')
    })

    const exerciseOption = useMutation({
        mutationKey: ['option', 'exercise', { cluster }],
        mutationFn: async (input: {
            marketIx: number,
            optionId: number,
            mint: string
        }) => {
            const { marketIx, optionId, mint } = input;
            const signer = provider.wallet.publicKey;
            const mintAddr = new PublicKey(mint);
            const solUsdPythAddr = new PublicKey('7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE');

            const user_asset_ata: PublicKey = await getAssociatedTokenAddress(mintAddr, signer, false);

            if (!user_asset_ata) {
                throw new Error('No user token acc found') 
            }           

            const [userAcc] = PublicKey.findProgramAddressSync(
                [
                  Buffer.from("account"),
                  Buffer.from(signer.toBase58())
                ],
                program.programId
            );      

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

        const exerciseSign = await program.methods
            .exercise(marketIx, optionId)
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
            console.log('Withdraw signature: ', signature)
            transactionToast(signature)
        },
        onError: () => toast.error('Failed')
    })

    return {
        buyOption,
        exerciseOption
    }
}
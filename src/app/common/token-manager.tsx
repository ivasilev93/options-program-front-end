import { token } from "@coral-xyz/anchor/dist/cjs/utils";
import { createAssociatedTokenAccountInstruction, createSyncNativeInstruction, getAssociatedTokenAddress, NATIVE_MINT } from "@solana/spl-token";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";


/**
 *@returns How many tokens is the user missing in order to perform the operation. If 0 is returned - he has enough. Else he needs to top up his balance with the returned amount.
 */
export async function checkUserTokenAmount(mintAddr: PublicKey, user: PublicKey, connection: Connection, tokenAmount: number): Promise<number> {
    const userTokenAddrr: PublicKey = await getAssociatedTokenAddress(mintAddr, user, false);
    const userTokenAccInfo = await connection.getAccountInfo(userTokenAddrr);

    if (!userTokenAccInfo) {
        console.log("No user token acc found for mint: ", mintAddr.toBase58());
        return tokenAmount;
    }
        

    const tokenBalanceInfo = await connection.getTokenAccountBalance(userTokenAddrr);    

    const tokenBalance = tokenBalanceInfo?.value.uiAmount || 0;
    const amountNeeded = tokenBalance - tokenAmount;
    
    return amountNeeded >= 0 ? 0 : tokenAmount - tokenBalance;    
}

export async function syncNativeTokenAmounts(user: PublicKey, connection: Connection, tokenAmount: number, tx: Transaction) {
    const userTokenAddrr: PublicKey = await getAssociatedTokenAddress(NATIVE_MINT, user, false);
    const userTokenAccInfo = await connection.getAccountInfo(userTokenAddrr);

    if (!userTokenAccInfo) {
        console.log("Creating  oken acc for NATIVE_MINT mint:")
        tx.add(
            createAssociatedTokenAccountInstruction(
                user,
                userTokenAddrr,
                user,
                NATIVE_MINT,
            )
        );
    }

    tx.add(
        SystemProgram.transfer({
          fromPubkey: user,
          toPubkey: userTokenAddrr,
          lamports: tokenAmount,
        }),
        createSyncNativeInstruction(userTokenAddrr)
      );    
}

export async function getTokenPrice(assetMint: string) {
    try {
        const response = await fetch(`https://lite-api.jup.ag/price/v2?ids=${assetMint}`);
        const data = await response.json();
        const price = data?.data?.[assetMint]?.price || null;
        console.log('price: ', price);
        return price;
      } catch (error) {
        console.error("Failed to fetch token price:", error);
        return null;
      }
}
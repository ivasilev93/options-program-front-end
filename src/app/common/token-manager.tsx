import { BN } from "@coral-xyz/anchor";
import { token } from "@coral-xyz/anchor/dist/cjs/utils";
import { createAssociatedTokenAccountInstruction, createSyncNativeInstruction, getAssociatedTokenAddress, NATIVE_MINT, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { TokenInfo } from "./market-context";

/**
 *@returns Returns many tokens is the user missing in order to perform the operation. If 0 is returned - he has enough. Else he needs to top up his balance with the returned amount.
 */
export async function checkUserTokenAmount(mintAddr: PublicKey, user: PublicKey, connection: Connection, tokenAmount: number, token_program: PublicKey): Promise<number> {
  
    const userTokenAddrr: PublicKey = await getAssociatedTokenAddress(mintAddr, user, false, token_program);
    const userTokenAccInfo = await connection.getAccountInfo(userTokenAddrr);

    if (!userTokenAccInfo) {
        console.log("No user token acc found for mint: ", mintAddr.toBase58());
        return tokenAmount;
    }        

    const tokenBalanceInfo = await connection.getTokenAccountBalance(userTokenAddrr);    
    console.log('tokenBalanceInfo', tokenBalanceInfo.value)
    console.log("tokenAmount", tokenAmount)

    const tokenBalance = Number(tokenBalanceInfo?.value.amount) || 0;
    const amountNeeded = tokenBalance - tokenAmount;
    console.log("amountNeeded", amountNeeded)
    
    return amountNeeded >= 0 ? 0 : tokenAmount - tokenBalance;    
}

export async function syncNativeTokenAmounts(user: PublicKey, connection: Connection, tokenAmount: number, tx: Transaction, token_program: PublicKey) {
    const userTokenAddrr: PublicKey = await getAssociatedTokenAddress(NATIVE_MINT, user, false, token_program);
    const userTokenAccInfo = await connection.getAccountInfo(userTokenAddrr);
    const amnt = Math.floor(tokenAmount) + 1000;
    console.log('amnt', amnt)
    console.log('token_program', token_program.toBase58())

    if (!userTokenAccInfo) {
        console.log("Creating  oken acc for NATIVE_MINT mint:")
        tx.add(
            createAssociatedTokenAccountInstruction(
                user,
                userTokenAddrr,
                user,
                NATIVE_MINT,
                token_program
            )
        );
    }

    tx.add(
        SystemProgram.transfer({
          fromPubkey: user,
          toPubkey: userTokenAddrr,
          lamports: amnt,
        }),
        createSyncNativeInstruction(userTokenAddrr, token_program)
      );    
}

export const tokensToMoney = (value: number | BN, decimals: number, price: number, rounding: number) => {

    const numValue = BN.isBN(value) ? value.toNumber() : value;
    const tvl = (numValue / Math.pow(10, decimals)) * (Number(price) || 0);
    return formatNumber(tvl, rounding);
  }

export  const formatNumber = (value: number | BN, decimals: number = 0) => {
    const numValue = BN.isBN(value) ? value.toNumber() : value;

    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(numValue);
  };

export async function getTokenPrice(assetMint: string) {
    console.log(`getTokenPrice called for ${assetMint}`)
    // return 1;

    //Local JUP mock token => set real addrr to get real values
    if (assetMint == '6urJ1afyysZPBiJwcmcpsF1c47uAoLons8ZcxYv3UNUs') {
      assetMint = 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'
    }

    try {
        const response = await fetch(`https://lite-api.jup.ag/price/v2?ids=${assetMint}`);
        const data = await response.json();
        const price = data?.data?.[assetMint]?.price || null;
        return price;
      } catch (error) {
        console.error("Failed to fetch token price:", error);
        return null;
      }
}

export async function getTokenMetadata(assetMint: string): Promise<{ symbol: string; logoURI: string } | null> {
  console.log(`getTokenMetadata called for ${assetMint}`)
  // return {
  //   symbol: "av",
  //   logoURI: 'asdasd'
  // };

   //Local JUP mock token => set real addrr to get real values
   if (assetMint == '6urJ1afyysZPBiJwcmcpsF1c47uAoLons8ZcxYv3UNUs') {
    assetMint = 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'
  }
  try {
    const response = await fetch(`https://lite-api.jup.ag/tokens/v1/token/${assetMint}`);
    const tokenInfo = await response.json();

    return {
      symbol: tokenInfo.symbol,
      logoURI: tokenInfo.logoURI
    };
  } catch (error) {
    console.error("Failed to fetch token metadata:", error);
    return null;
  }
}

export async function detectTokenProgram(connection: Connection, mint: PublicKey): Promise<PublicKey> {
  const mintAccount = await connection.getAccountInfo(mint);
  if (!mintAccount) throw new Error("Mint not found");
  console.log('Mint owner info: ', mintAccount.owner.toBase58())

  const owner = mintAccount.owner;
  if (owner.equals(TOKEN_PROGRAM_ID)) return TOKEN_PROGRAM_ID;
  if (owner.equals(TOKEN_2022_PROGRAM_ID)) return TOKEN_2022_PROGRAM_ID;

  throw new Error(`Unknown token program: ${owner.toBase58()}`);
}

export async function fetchTokenData(mintAddresses: string[]): Promise<Record<string, TokenInfo>> {
  const tokenInfoArray = await Promise.all(
      mintAddresses.map(async (mint) => {
          const [price, metadata] = await Promise.all([
              getTokenPrice(mint),
              getTokenMetadata(mint),
          ]);

          return {
              mint,
              price,
              symbol: metadata?.symbol ?? "N/A",
              logoUrl: metadata?.logoURI ?? "",
          };
      })
  );

  return tokenInfoArray.reduce((acc, tokenInfo) => {
      acc[tokenInfo.mint] = tokenInfo;
      return acc;
  }, {} as Record<string, TokenInfo>);
}
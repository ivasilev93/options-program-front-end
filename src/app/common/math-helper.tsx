
export function estimateWithdrawAmount(
    lpTokensToBurn: number,
    lpMinted: number,
    marketReserveSupply: number,
    marketPremiums: number,
    marketCommittedReserve: number
) {

    if (lpTokensToBurn <= 0) {
        return [0, 0];
    }

    const scale = 1_000_000_000;

    // Calculate ownership ratio (using BigInt to prevent precision loss)
    const ownershipRatio = (BigInt(lpTokensToBurn) * BigInt(scale)) / BigInt(lpMinted);

    // Calculate market TVL
    const marketTvl = marketReserveSupply + marketPremiums;
    if (marketTvl <= 0) {
        return [0, 0];
    }

    // Calculate potential withdraw amount
    const potentialWithdrawAmount = Number((ownershipRatio * BigInt(marketTvl)) / BigInt(scale));

    // Calculate max withdrawable amount
    const uncommittedReserve = marketReserveSupply - marketCommittedReserve;
    const maxWithdrawable = uncommittedReserve + marketPremiums;
    const withdrawableAmount = Math.min(maxWithdrawable, potentialWithdrawAmount);

    if (withdrawableAmount < 1) {
        return [0, 0];
    }

    // Calculate actual LP tokens to burn
    let actualLpTokensToBurn: number;
    if (withdrawableAmount < potentialWithdrawAmount) {
        actualLpTokensToBurn = Number(
            (BigInt(withdrawableAmount) * BigInt(lpMinted)) / BigInt(marketTvl)
        );
    } else {
        actualLpTokensToBurn = lpTokensToBurn;
    }

    // Final validation
    if (actualLpTokensToBurn <= 0) {
        return [0, 0];
    }

    return [withdrawableAmount, actualLpTokensToBurn];
}

export function estimateLpShares(
    baseAssetAmount: number,
    minAmountOut: number,
    lpMinted: number,
    marketReserveSupply: number,
    marketPremiums: number
) {
    if (baseAssetAmount <= 0) {
        return 0;
    }
    if (minAmountOut <= 0) {
        return 0;
    }

    // Calculate market TVL
    const marketTvl = marketPremiums + marketReserveSupply;

    let lpTokensToMint: number;

    // Handle the case where no LP tokens have been minted yet
    if (lpMinted === 0) {
        lpTokensToMint = baseAssetAmount;
    } else {
        const scale = 1_000_000_000;

        // Calculate scaled asset (using BigInt to prevent precision loss)
        const scaledAsset = (BigInt(baseAssetAmount) * BigInt(scale)) / BigInt(marketTvl);
        
        // Calculate LP tokens
        const lpTokens = (scaledAsset * BigInt(lpMinted)) / BigInt(scale);
        
        // Convert to number
        lpTokensToMint = Number(lpTokens);

        // Ensure the amount is not dust
        if (lpTokensToMint < 1) {
            return 0;
        }
    }

    return lpTokensToMint;
}

/**
 * Calculates premium for a given market (asset), based on provided data 
 * @param strikePrice - strike price in USD
 * @param spotPrice - spot price in USD
 * @param timeToExpiry - time to expiry in years
 * @param volatility - annualized volatility (decimal, e.g., 0.5 for 50%)
 * @param optionType - "CALL" or "PUT"
 * @param assetDecimals - number of decimals for the asset
 * @returns [The premium amount in token units (scaled by the asset decimals), premium in USD]
 */
export function calculatePremium(
    strikePrice: number,
    spotPrice: number,
    timeToExpiry: number,
    volatility: number,
    optionType: "CALL" | "PUT",
    assetDecimals: number
  ): [number, number] {
    console.log(
      `Params: Strike: ${strikePrice}, Spot: ${spotPrice}, Time: ${timeToExpiry}, Vol: ${volatility}, Type: ${optionType}, Decimals: ${assetDecimals}`
    );
  
    // Convert to numbers for calculations
    const s = spotPrice;
    const k = strikePrice;
  
    // Assumed risk-free rate of 0 - for simplicity
    const d1 = (Math.log(s / k) + (volatility * volatility / 2.0) * timeToExpiry) / 
               (volatility * Math.sqrt(timeToExpiry));
    const d2 = d1 - volatility * Math.sqrt(timeToExpiry);
  
    // Calculate N(d1) and N(d2) using approximation function
    const n_d1 = approximateNormalCdf(d1);
    const n_d2 = approximateNormalCdf(d2);
  
    let premium: number;
    if (optionType === "CALL") {
      premium = s * n_d1 - k * n_d2;
    } else {
      // PUT option
      const n_neg_d2 = approximateNormalCdf(-d2); // N(-d2)
      const n_neg_d1 = approximateNormalCdf(-d1); // N(-d1)
      premium = k * n_neg_d2 - s * n_neg_d1;
    }
  
    const usdPerToken = s;
    const premiumInTokens = premium / usdPerToken;

    const tokenScaling = Math.pow(10, assetDecimals);
  
    // Potential round err
    const premiumScaled = premiumInTokens * tokenScaling;

    
    return [premiumScaled, premium];
  }
  
  /**
   * Approximates the standard normal cumulative distribution function (CDF) N(x)
   * @param x - input value
   * @returns Approximated CDF value
   */
  function approximateNormalCdf(x: number): number {
    // Simple approximation for N(x)
    const t = 1.0 / (1.0 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2.0);
    const p = 1.0 - d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    
    return x >= 0.0 ? p : 1.0 - p;
  }
  
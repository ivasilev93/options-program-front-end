
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
    const ownershipRatio = lpMinted == 0 ? BigInt(1) : (BigInt(lpTokensToBurn) * BigInt(scale)) / BigInt(lpMinted);
    console.log('lpTokensToBurn', lpTokensToBurn) 
    console.log('lpMinted', lpMinted) 
    console.log('ownershipRatio', ownershipRatio) 

    // Calculate market TVL
    const marketTvl = marketReserveSupply + marketPremiums;
    if (marketTvl <= 0) {
        return [0, 0];
    }

    // Calculate potential withdraw amount
    const potentialWithdrawAmount = Number((ownershipRatio * BigInt(marketTvl)) / BigInt(scale));
    console.log('potentialWithdrawAmount', potentialWithdrawAmount) 


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
        lpTokensToMint = baseAssetAmount * 1000;
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

// Using BigInt for handling large integer calculations without precision loss
const PRECISION = 100000000n;  // Same precision as Rust version
const SECONDS_IN_YEAR = 31536000n;  // 365 days

enum CustomError {
  InvalidStrikePrice = "InvalidStrikePrice",
  NotImplemented = "NotImplemented",
  Overflow = "Overflow",
  PremiumCalcError = "PremiumCalcError",
}

// Represents option expiry information
interface Expiry {
  toSeconds(): bigint;
}


// Helper function to require a condition or throw error
function require(condition: boolean, errorMessage: CustomError): void {
  if (!condition) {
    throw new Error(errorMessage);
  }
}

// Square root function for BigInt (integer approximation)
function sqrt(value: bigint): bigint {
  if (value < 0n) {
    throw new Error("Cannot calculate square root of negative number");
  }
  if (value === 0n) return 0n;
  
  let x = value;
  let y = (x + 1n) / 2n;
  
  while (y < x) {
    x = y;
    y = (x + value / x) / 2n;
  }
  
  return x;
}

// Calculate call option premium using a simplified model suitable for on-chain execution
function calculatePremium(
  currentPrice: bigint,
  strikePrice: bigint,
  isCall: boolean,
  timeToExpiry: bigint,  // In years, scaled by PRECISION
  volatility: bigint     // Annual volatility, scaled by PRECISION
): bigint {
  // Basic simplified model for demonstration
  // 1. Intrinsic value component
  const intrinsic = isCall ? 
    currentPrice > strikePrice ? currentPrice - strikePrice : 0n 
    :
    strikePrice > currentPrice ? strikePrice - currentPrice : 0n;
  
  // 2. Time value approximation
  // For integer math, we use a simplified formula that approximates BSM
  // volatility * price * sqrt(time_to_expiry)
  
  // Calculate sqrt using integer approximation
  const timeSqrt = sqrt(timeToExpiry);
  
  // Time value component (simplified for integer math)
  const timeValue = (currentPrice * volatility * timeSqrt) / (PRECISION * 10000n);
  
  // If deep out of money (current < 0.8 * strike), reduce premium
  const moneynessFactor = currentPrice < (strikePrice * 8n) / 10n
    ? (currentPrice * PRECISION) / strikePrice
    : PRECISION;
  
  const timeValueAdjusted = (timeValue * moneynessFactor) / PRECISION;
  const premiumPrice = intrinsic + timeValueAdjusted;
  
  return premiumPrice;
}

// Calculate option premium using adapted Black-Scholes with integer math
function calculateOptionPremium(
  strikePriceUsd: bigint,
  spotPriceUsd: bigint,
  timeToExpirySeconds: bigint,
  assetDecimals: number,
  vol: bigint,
  optionType: String,
  quantity: bigint
): [bigint, bigint] {
  // Validate parameters
  require(strikePriceUsd > 0n, CustomError.InvalidStrikePrice);

  console.log('calculateOptionPremium called: ', strikePriceUsd, spotPriceUsd, timeToExpirySeconds, assetDecimals, vol, optionType, quantity)

  
  // Get time to expiry in years (using integer division)
  // const timeToExpirySeconds = expiry.toSeconds();
  
  const timeToExpiry = (timeToExpirySeconds * PRECISION) / SECONDS_IN_YEAR;
  
  // Choose appropriate volatility based on expiry time
  
  // Volatility as a scaled integer (bps to decimal equivalent)
  const volatility = (vol * PRECISION) / 10000n;
  
  // Calculate premium based on option type
  let scaledUsdPremium: bigint = calculatePremium(
    spotPriceUsd,
    strikePriceUsd,
    optionType === "CALL",
    timeToExpiry,
    volatility
  );
  
  const totalScaledUsdPremium = scaledUsdPremium * quantity;
  
  if (totalScaledUsdPremium <= 0n) {
    console.log('Premium calculation erros -> totalScaledUsdPremium <= 0n')
  }

  const premiumInTokens = (totalScaledUsdPremium * BigInt(10 ** assetDecimals)) / spotPriceUsd;

  return [totalScaledUsdPremium, premiumInTokens];
}

export {
  CustomError,
  calculateOptionPremium
};
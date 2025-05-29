
import { useAnchorProvider } from "@/components/solana/solana-provider"
import { useTransactionToast } from "@/components/ui/ui-layout"
import { getOptionsProgram, getOptionsProgramId } from "@/contract/options-program-exports"
import { useMemo } from "react"
import { Cluster, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import { useCluster } from "@/components/cluster/cluster-data-access"
import { BN, ProgramAccount } from "@coral-xyz/anchor"
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, NATIVE_MINT } from "@solana/spl-token"
import { checkUserTokenAmount, detectTokenProgram, syncNativeTokenAmounts } from "./token-manager"

export type MarketAccount = {
    id: number;
    name: string;
    feeBps: number;
    // bump: number;
    reserveSupply: number;
    committedReserve: number;
    premiums: number;
    lpMinted: number;
    priceFeed: string;
    assetDecimals: number;
    assetMint: string;
    hour1VolatilityBps: number;
    hour4VolatilityBps: number;
    day1VolatilityBps: number;
    day3VolatilityBps: number;
    weekVolatilityBps: number;
    volLastUpdated: number;
  }; 


export function rpcCalls() {
    const { cluster } = useCluster()
    const transactionToast = useTransactionToast()
    const provider = useAnchorProvider()
    const programId = useMemo(() => getOptionsProgramId(cluster.network as Cluster), [cluster])
    const program = useMemo(() => getOptionsProgram(provider, programId), [provider, programId])
    const connection = provider.connection;

    async function fetchMarkets(): Promise<ProgramAccount[]> {
        return program.account.market.all()
    }

    async function getProgramAccount(): Promise<any> {
        return provider.connection.getParsedAccountInfo(programId)
    }

    async function depositIntoMarket(
        amount: number,
        min_amount_out: number,
        ix: number,
        mint: string): Promise<any> {

      const signer = provider.wallet.publicKey;
      const mintAddr = new PublicKey(mint);

      const token_program_id = await detectTokenProgram(connection, mintAddr);
      const user_asset_ata: PublicKey = await getAssociatedTokenAddress(mintAddr, signer, false, token_program_id);
      console.log('aaaa', user_asset_ata.toBase58())
      console.log('2222', await connection.getTokenAccountBalance(user_asset_ata));
      let transaction = new Transaction();            

      const tokenDiff = await checkUserTokenAmount(mintAddr, signer, connection, amount, token_program_id);

      if (tokenDiff > 0) {
        if (mint == NATIVE_MINT.toBase58()) {
          await syncNativeTokenAmounts(signer, connection, tokenDiff, transaction, token_program_id);
        }
        else {   
          throw new Error('Not enough tokens')
        }   
      }           

      const [market, marketVault, _, lpMint] = getMarketAssociatedPdas(ix);
      // const [lpMint] = PublicKey.findProgramAddressSync(
      //   [
      //     Buffer.from("market_lp_mint"),
      //     Buffer.from(new Uint8Array(new Uint16Array([ix]).buffer))
      //   ],
      //   program.programId
      // );

      // const [market] = PublicKey.findProgramAddressSync(
      //       [
      //         Buffer.from("market"),
      //         Buffer.from(new Uint8Array(new Uint16Array([ix]).buffer))
      //       ],
      //       program.programId
      //     );
          
      //     const [marketVault] = PublicKey.findProgramAddressSync(
      //       [
      //         Buffer.from("market_vault"),
      //         Buffer.from(new Uint8Array(new Uint16Array([ix]).buffer))
      //       ],
      //       program.programId
      //     );
     const user_lp_ata: PublicKey = await getAssociatedTokenAddress(lpMint, signer, false, token_program_id);
        
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
      tokenProgram:token_program_id
    }).instruction();

    transaction.add(depositIx); 
    const createSignature = await provider.sendAndConfirm(transaction);        

    return createSignature;
  }

  async function withdrawMarket(
    lp_tokens_to_burn: number,
    min_amount_out: number,
    ix: number,
    mint: PublicKey): Promise<any> {
    
    const signer = provider.wallet.publicKey;

    const mintAddr = new PublicKey(mint);
    const token_program_id = await detectTokenProgram(connection, mintAddr);
    const user_asset_ata: PublicKey = await getAssociatedTokenAddress(new PublicKey(mint), signer, false, token_program_id);

    const accInfo = await connection.getAccountInfo(user_asset_ata);
    if (!accInfo) {
      console.log('User has no ATA not right...')
      throw Error("invalid state here.. user has no ata, but withdraws...")     
    } 

  const [market, marketVault, _, lpMint] = getMarketAssociatedPdas(ix);

  const user_lp_ata: PublicKey = await getAssociatedTokenAddress(lpMint, signer, false, token_program_id);
  
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
    tokenProgram:token_program_id
  }).rpc();   
  
  return withdrawSign;
}

async function buyOption(marketIx: number,
  option: string,
  strikePrice: number,
  expirySetting: number,
  quantity: number,
  mint: string,
  estPremium: number): Promise<any> {

    const signer = provider.wallet.publicKey;
    const mintAddr = new PublicKey(mint);

    //TODO fix this hadvoded stuff
    // const solUsdPythAddr = new PublicKey('7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE'); // SOL pyth
    const solUsdPythAddr = new PublicKey('7dbob1psH1iZBS7qPsm3Kwbf5DzSXK8Jyg31CTgTnxH5'); // JUP

    const token_program_id = await detectTokenProgram(connection, mintAddr);
    console.log('mint addr?', mintAddr.toBase58())

    const user_asset_ata: PublicKey = await getAssociatedTokenAddress(mintAddr, signer, false, token_program_id);
    // const mintInfo = await getMint(connection, mintAddr, undefined, TOKEN_PROGRAM_ID);
    let transaction = new Transaction();
    const tokensRequired = estPremium * 1.1;  

    const tokenDiff = await checkUserTokenAmount(mintAddr, signer, connection, tokensRequired, token_program_id);
    console.log('token diff', tokenDiff);

    if (tokenDiff > 0) {
      if (mint == NATIVE_MINT.toBase58()) {
        await syncNativeTokenAmounts(signer, connection, tokenDiff, transaction, token_program_id);
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

    const [market, marketVault, protocolFeesVault, ] = getMarketAssociatedPdas(marketIx);

    // const [market] = PublicKey.findProgramAddressSync(
    //     [
    //       Buffer.from("market"),
    //       Buffer.from(new Uint8Array(new Uint16Array([marketIx]).buffer))
    //     ],
    //     program.programId
    //   );
      
    // const [marketVault] = PublicKey.findProgramAddressSync(
    //     [
    //       Buffer.from("market_vault"),
    //       Buffer.from(new Uint8Array(new Uint16Array([marketIx]).buffer))
    //     ],
    //     program.programId
    //   );
    // const [protocolFeesVault] = PublicKey.findProgramAddressSync(
    //     [
    //       Buffer.from("protocol_fees_vault"),
    //       Buffer.from(new Uint8Array(new Uint16Array([marketIx]).buffer))
    //     ],
    //     program.programId
    // );
    const payload = {
        marketIx: marketIx,
        option: option === "CALL" ? { call: {} } : { put: {} },
        strikePriceUsd: new BN(strikePrice),
        expirySetting: expiryToEnum(expirySetting),
        quantity: new BN(quantity)
        //slippage
    };
    console.log('payload', 
        {
            marketIx: marketIx,
            option: option === "CALL" ? { call: {} } : { put: {} },
            strikePriceUsd: strikePrice,
            expirySetting: expiryToEnum(expirySetting),
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
        tokenProgram:token_program_id
      }).instruction();
      
      transaction.add(depositIx); 
      const depositSignature = await provider.sendAndConfirm(transaction);        
      return depositSignature;
  }

  async function exercise(marketIx: number, optionIx: number, mint: string):Promise<any> {
    const signer = provider.wallet.publicKey;
    const mintAddr = new PublicKey(mint);
    const token_program_id = await detectTokenProgram(connection, mintAddr);

    const user_asset_ata: PublicKey = await getAssociatedTokenAddress(mintAddr, signer, false, token_program_id);    
    // const solUsdPythAddr = new PublicKey('7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE'); // SOL pyth
    const solUsdPythAddr = new PublicKey('7dbob1psH1iZBS7qPsm3Kwbf5DzSXK8Jyg31CTgTnxH5'); // JUP
    
    const [market, marketVault, , ] = getMarketAssociatedPdas(marketIx);
    const [userAcc] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("account"),
        Buffer.from(signer.toBuffer())
      ],
      program.programId
    );      

    const exerciseSign = await program.methods
      .exercise({
        marketIx: marketIx, 
        optionId: optionIx
      })
      .accountsStrict({
        signer: signer,
        account: userAcc,
        userTokenAcc: user_asset_ata,
        market: market,
        marketVault: marketVault,
        assetMint: mint,
        priceUpdate: solUsdPythAddr,
        tokenProgram:token_program_id
      }).rpc();   
    
    return exerciseSign;
  }

  async function getUserAccount(account: PublicKey): Promise<any> {
    const [userAcc] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("account"),
        Buffer.from(account.toBuffer())
      ],
      program.programId
    );     

    const userAccData = await program.account.userAccount.fetch(userAcc);
    console.log('user acc', userAccData)
    return userAccData;
  }

    async function getUserLpTokenBalance(marketIx: number, userPubkey: string):Promise<any> {
      const [lpMint] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("market_lp_mint"),
          Buffer.from(new Uint8Array(new Uint16Array([marketIx]).buffer))
        ],
        program.programId
      );

      const token_program_id = await detectTokenProgram(connection, lpMint);
      const userTokenAddrr: PublicKey = await getAssociatedTokenAddress(
        lpMint,
        new PublicKey(userPubkey),
        false,
        token_program_id);

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
        getProgramAccount,
        fetchMarkets,
        depositIntoMarket,
        getUserLpTokenBalance,
        withdrawMarket,
        buyOption,
        getUserAccount,
        exercise
    }

    function expiryToEnum(expiry: number) {
      switch (expiry) {
        case 0: 
          return { hour1: {} }
        case 1: 
          return { hour4: {} }
        case 2: 
          return { day1: {} }
        case 3: 
          return { day3: {} }
        case 4: 
          return { week: {} }
      default:
        {}
     }
    }

    function getMarketAssociatedPdas(marketIx: number) {
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
        const [lpMint] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("market_lp_mint"),
            Buffer.from(new Uint8Array(new Uint16Array([marketIx]).buffer))
          ],
          program.programId
        );

        return [market, marketVault, protocolFeesVault, lpMint]
    }
}
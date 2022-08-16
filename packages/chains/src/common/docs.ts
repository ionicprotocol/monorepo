export const defaultDocs = (blockExplorerUrl: string, tokenAddress: string): string => {
  return `Check out the token tracker for this asset in the 
  <a href="${blockExplorerUrl}/token/${tokenAddress}" target="_blank" style="color: #BCAC83; cursor="pointer">Official Block Explorer</a>, where
  you can access the token's site as well as market information`;
};

export const ellipsisDocs = (poolAddress: string, poolName: string, tokenAddress: string) => {
  return `Head over to the <a href="https://ellipsis.finance//${poolAddress}" target="_blank" style="color: #BCAC83; cursor="pointer">${poolName} Ellipsis Finance Pool</a>
  and click on "Add Liquidity". You can then supply any of the underlying assets, and upon adding liquidity, you 
  will get back the <a href="https://bscscan.com/address/${tokenAddress}" target="_blank" style="color: #BCAC83; cursor="pointer">${poolName} pool LP tokens</a>. Come back 
  back here and hit "MAX" to deposit them all in this pool. 
  `;
};

export const ankrBNBDocs = (variant: string) => {
  return `Head over to <a href="https://www.ankr.com/staking/stake/bnb/?token=${variant}" target="_blank" style="color: #BCAC83; cursor="pointer">Ankr BNB Staking</a>, where you
  can acquire ${variant} by depositing BNB`;
};

export const pancakeSwapDocs = (token0: string, token1: string, poolName: string, tokenAddress: string) => {
  return `<p>You can acquire these Pancakeswap LP tokens <a href="https://pancakeswap.finance/add/${token0}/${token1}" target="_blank" style="color: #BCAC83; cursor="pointer">here</a>.
  Ensure that the tokens are correct, and tap "Add Liquidity". <b>NOTE:</b> you might have to convert between 
  tokens and/or have to approve Pancakeswap to spend them. Finally, click on supply.</p>
  You will get back <a href="https://bscscan.com/address/${tokenAddress}" target="_blank" style="color: #BCAC83; cursor="pointer">Pancakeswap ${poolName} LP tokens</a> in your wallet. 
  Come back here and hit "MAX" to deposit them all in this pool. 
  `;
};

export const quickSwapDocs = (token0: string, token1: string, poolName: string, tokenAddress: string) => {
  return `<p>You can acquire these Quickswap LP tokens <a href="https://quickswap.exchange/#/pools">here</a>.
  Input the token addresses -- token 1: ${token0} and  token 2: ${token1}". <b>NOTE:</b> you might have to convert between 
  tokens and/or have to approve QuickSwap to spend them. Finally, click on supply.</p>
  You will get back <a href="https://polygonscan.com/address/${tokenAddress}">Quickswap ${poolName} LP tokens</a> in your wallet. 
  Come back here and hit "MAX" to deposit them all in this pool. 
  `;
};

export const beamSwapDocs = (token0: string, token1: string, poolName: string, tokenAddress: string) => {
  return `<p> 1. Head to <a href="https://app.beamswap.io/exchange/add/${token0}/${token1}">BeamSwap</a> and supply the desired liquidity pairs.
  <b>NOTE:</b> you might have to convert between tokens and/or have to approve BeamSwap to spend them.</p> 
  <p> 2. You will get back <a href="https://moonbeam.moonscan.com/address/${tokenAddress}">BeamSwap ${poolName} LP tokens</a> in your wallet.</p>  
  <p> 3. Come back here and hit "MAX" to deposit them all in this pool. </p>
  `;
};

export const beamSwapStableDocs = (poolName: string, tokenAddress: string) => {
  return `<p> 1. Head to <a href="https://app.beamswap.io/exchange/add/multi/${poolName}">BeamSwap</a> and supply the desired liquidity pairs.
  <b>NOTE:</b> you might have to convert between tokens and/or have to approve BeamSwap to spend them.</p> 
  <p> 2. You will get back <a href="https://moonbeam.moonscan.com/address/${tokenAddress}">BeamSwap ${poolName} Stable LP tokens</a> in your wallet.</p>  
  <p> 3. Come back here and hit "MAX" to deposit them all in this pool. </p>
  `;
};

export const curveFinancePolygonDocs = (
  poolNumber: number,
  poolName: string,
  tokenAddress: string,
  isFactory = false
) => {
  return `Head over to the <a href="https://polygon.curve.fi${
    isFactory ? "/factory/" : "/"
  }${poolNumber}/deposit"> Curve ${poolName} Pool</a>. You can then supply any of the underlying assets, and upon adding liquidity, 
  you will get back the <a href="https://polygonscan.com/address/${tokenAddress}"> Curve ${poolName} LP tokens</a>. Come back back 
  here and hit "MAX" to deposit them all in this pool. 
  `;
};

export const jarvisDocs = (v: string) => {
  return `You can acquire this asset on the <a href="https://${v}-app.jarvis.exchange/" target="_blank" style="color: #BCAC83; cursor="pointer">Jarvis Network</a> website`;
};

export const arrakisDocs = (networkName: string, chainId: number, vaultAddress: string) => {
  return `To acquire this Arrakis Vault token: <p> 1. Make sure you are connected to ${networkName} Network on your browser wallet </p>
  <p> 2. Head to the <a href="https://beta.arrakis.finance/vaults/${chainId}/${vaultAddress}/add" target="_blank" style="color: #BCAC83; cursor="pointer">Arrakis Finance Vault</a> and
  deposit the desired amount of token pairs. <b>NOTE:</b> you might have to convert between tokens and/or have to approve Arrakis to spend them. </p>
  <p> 3. Click on "Deposit & Stake". This will credit your wallet with the Arrakis Vault Tokens</p>
  <p> 4. Come back back here and hit "MAX" to deposit them all in this pool.</p>
  `;
};

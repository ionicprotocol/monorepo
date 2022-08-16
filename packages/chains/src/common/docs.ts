export const defaultDocs = (blockExplorerUrl: string, tokenAddress: string): string => {
  return `Check out the token tracker for this asset in the 
  <a href="${blockExplorerUrl}/token/${tokenAddress}">Official Block Explorer</a>, where
  you can access the token's site as well as market information`;
};

export const ellipsisDocs = (poolAddress: string, poolName: string, tokenAddress: string) => {
  return `Head over to the <a href="https://ellipsis.finance//${poolAddress}">${poolName} Ellipsis Finance Pool</a>
  and click on "Add Liquidity". You can then supply any of the underlying assets, and upon adding liquidity, you 
  will get back the <a href="https://bscscan.com/address/${tokenAddress}">${poolName} pool LP tokens</a>. Come back 
  back here and hit "MAX" to deposit them all in this pool. 
  `;
};

export const ankrBNBDocs = (variant: string) => {
  return `Head over to <a href="https://www.ankr.com/staking/stake/bnb/?token=${variant}">Ankr BNB Staking</a>, where you
  can acquire ${variant} by depositing BNB`;
};

export const pcsDocs = (token0: string, token1: string, poolName: string, tokenAddress: string) => {
  return `<p>You can acquire these Pancakeswap LP tokens <a href="https://pancakeswap.finance/add/${token0}/${token1}">here</a>.
  Ensure that the tokens are correct, and tap "Add Liquidity". <b>NOTE:</b> you might have to convert between 
  tokens and/or have to approve Pancakeswap to spend them. Finally, click on supply.</p>
  You will get back <a href="https://bscscan.com/address/${tokenAddress}">Pancakeswap ${poolName} LP tokens</a> in your wallet. 
  Come back here and hit "MAX" to deposit them all in this pool. 
  `;
};

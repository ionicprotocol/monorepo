import { SupportedChains } from "@ionicprotocol/types";

export const defaultDocs = (blockExplorerUrl: string, tokenAddress: string): string => {
  return `
  <p><b>How to acquire this token</b><p/><br />
  <p>Check out the token tracker for this asset in the <a href="${blockExplorerUrl}/token/${tokenAddress}" target="_blank" style="color: #BCAC83;">Official Block Explorer</a>, where you can access the token's site as well as market information.</p>`;
};

export const wrappedAssetDocs = (chainId: SupportedChains) => {
  const wrapAddress = {
    [SupportedChains.bsc]: {
      swapName: "PancakeSwap",
      swapAddress: "https://pancakeswap.finance/swap?outputCurrency=0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    },
    [SupportedChains.polygon]: {
      swapName: "SushiSwap",
      swapAddress:
        "https://app.sushi.com/swap?tokens=MATIC&tokens=0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270&chainId=137",
    },
    [SupportedChains.arbitrum]: {
      swapName: "SushiSwap",
      swapAddress:
        "https://app.sushi.com/swap?inputCurrency=ETH&outputCurrency=0x82aF49447D8a07e3bd95BD0d56f35241523fBab1&chainId=42161",
    },
    [SupportedChains.ganache]: {},
    [SupportedChains.neon_devnet]: {
      swapName: "MoraSwap",
      swapAddress: "https://moraswap.com/exchange/swap",
    },
    [SupportedChains.chapel]: {},
    [SupportedChains.lineagoerli]: {
      swapName: "Uniswap",
      swapAddress: "https://swap.goerli.linea.build/#/swap",
    },
    [SupportedChains.ethereum]: {
      swapName: "Uniswap",
      swapAddress: "https://app.uniswap.org/#/swap?outputCurrency=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    },
  }[chainId];

  return `
  <p><b>How to acquire the wrapped token: </b><p/><br />
  Head over to the <a href="${wrapAddress.swapAddress}" target="_blank" style="color: #BCAC83;">${wrapAddress.swapName} Exchange</a> and swap your native token for the wrapped token.</p>
  `;
};

export const ellipsisDocs = (poolAddress: string, poolName: string, tokenAddress: string) => {
  return `
  <p><b>How to acquire this token</b><p/><br />
  <p> 1. Head over to the <a href="https://ellipsis.finance/pool/${poolAddress}" target="_blank" style="color: #BCAC83;">${poolName} Ellipsis Finance Pool</a> and click on "Add Liquidity".</p><br />
  <p> 2. You can then supply any of the underlying assets, and upon adding liquidity.</p>
  <p> You will get back the <a href="https://bscscan.com/token/${tokenAddress}" target="_blank" style="color: #BCAC83;">${poolName} pool LP tokens</a>.</p><br />
  <p> 3. Come back here and hit "MAX" to deposit them all in this pool.</p>
  `;
};

export const ankrCertificateDocs = (variant: string, chain: string) => {
  return `
  <p><b>How to acquire this token</b><p/><br />
  <p>Head over to <a href="https://www.ankr.com/staking/stake/${chain.toLowerCase()}/?token=${variant}" target="_blank" style="color: #BCAC83;">Ankr ${chain} Staking</a>, where you can acquire ${variant} by depositing ${chain}</p>
  `;
};

export const clayStackDocs = (tokenName: string, chain: string) => {
  return `
  <p><b>How to acquire this token</b><p/><br />
  <p>Head over to <a href="https://app.claystack.com/stake/${chain.toLowerCase()}" target="_blank" style="color: #BCAC83;">ClayStack ${chain} Staking</a>, where you can acquire cs${tokenName} by depositing ${tokenName}</p>
  `;
};

export const stkBNBDocs = () => {
  return `
  <p><b>How to acquire this token</b><p/><br />
  <p><code>stkBNB</code> is the liquid staked representative for BNB issued by pSTAKE. You can liquid stake your BNB  <a href="https://bnb.pstake.finance/" target="_blank" style="color: #BCAC83;">here</a>.
  `;
};

export const StaderXDocs = (chainName: string, token: string) => {
  const baseTokenName = token.slice(0, -1);
  return `
  <p><b>How to acquire this token</b><p/><br />
  <p>Head over to <a href="https://${chainName}.staderlabs.com/liquid-staking/${token.toLowerCase()}/" target="_blank" style="color: #BCAC83;">Stader Lab's ${baseTokenName} Staking</a>, where you can acquire ${token} by depositing ${baseTokenName}</p>
  `;
};

export const pancakeSwapDocs = (token0: string, token1: string, poolName: string, tokenAddress: string) => {
  return `
  <p><b>How to acquire this token</b><p/><br />
  <p> 1. Head to <a href="https://pancakeswap.finance/add/${token0}/${token1}" target="_blank" style="color: #BCAC83;">Pancakeswap</a>.</p><br />
  <p> 2. Ensure that the tokens are correct, and tap "Add Liquidity".</p>
  <p><b>NOTE:</b> You might have to convert between tokens and/or have to approve Pancakeswap to spend them. Finally, click on supply.</p>
  <p>You will get back <a href="https://bscscan.com/token/${tokenAddress}" target="_blank" style="color: #BCAC83;">Pancakeswap ${poolName} LP tokens</a> in your wallet.</p><br />
  <p> 3. Come back here and hit "MAX" to deposit them all in this pool.</p>
  `;
};

export const apeSwapDocs = (token0: string, token1: string, poolName: string, tokenAddress: string) => {
  return `
  <p><b>How to acquire this token</b><p/><br />
  <p> 1. Head to <a href="https://apeswap.finance/add-liquidity/${token0}/${token1}" target="_blank" style="color: #BCAC83;">Apeswap</a>.</p><br />
  <p> 2. Ensure that the tokens are correct, and tap "Add Liquidity".</p>
  <p><b>NOTE:</b> You might have to convert between tokens and/or have to approve Pancakeswap to spend them. Finally, click on supply.</p>
  <p>You will get back <a href="https://bscscan.com/token/${tokenAddress}" target="_blank" style="color: #BCAC83;">Apeswap ${poolName} LP tokens</a> in your wallet.</p><br />
  <p> 3. Come back here and hit "MAX" to deposit them all in this pool.</p>
  `;
};

export const quickSwapDocs = (token0: string, token1: string, poolName: string, tokenAddress: string) => {
  return `
  <p><b>How to acquire this token</b><p/><br />
  <p> 1. Head to <a href="https://quickswap.exchange/#/pools" target="_blank" style="color: #BCAC83;">Quickswap</a>.</p><br />
  <p> 2. Input the token addresses -- token 1: ${token0} and  token 2: ${token1}".</p>
  <p><b>NOTE:</b> You might have to convert between tokens and/or have to approve QuickSwap to spend them.</p><br />
  <p> 3. Finally, click on supply.</p>
  <p>You will get back <a href="https://polygonscan.com/token/${tokenAddress}" target="_blank" style="color: #BCAC83;">Quickswap ${poolName} LP tokens</a> in your wallet.</p><br />
  <p> 4. Come back here and hit "MAX" to deposit them all in this pool.</p>
  `;
};

export const curveFinancePolygonDocs = (
  poolNumber: number | string,
  poolName: string,
  tokenAddress: string,
  isFactoryOrCrypto: boolean | string = false
) => {
  let poolPath: string;
  if (isFactoryOrCrypto === false) {
    poolPath = "/";
  } else if (isFactoryOrCrypto === true) {
    poolPath = "/factory/";
  } else {
    poolPath = "/${isFactoryOrCrypto}/";
  }
  return `
  <p><b>How to acquire this token</b><p/><br />
  <p> 1. Head over to the <a href="https://polygon.curve.fi${poolPath}${poolNumber}/deposit" target="_blank" style="color: #BCAC83;"> Curve ${poolName} Pool</a>.</p><br />
  <p> 2. You can then supply any of the underlying assets, and upon adding liquidity.</p>
  <p>You will get back the <a href="https://polygonscan.com/token/${tokenAddress}" target="_blank" style="color: #BCAC83;"> Curve ${poolName} LP tokens</a>.</p><br />
  <p> 3. Come back back here and hit "MAX" to deposit them all in this pool.</p>
  `;
};

export const balancerDocs = (chain: string, poolAddress: string, poolName: string, tokenAddress: string) => {
  return `
  <p><b>How to acquire this token</b><p/><br />
  <p> 1. Head over to the <a href="https://${chain}.balancer.fi/#/pool/${poolAddress}" target="_blank" style="color: #BCAC83;"> Balancer ${poolName} Pool</a>.</p><br />
  <p> 2. You can then supply any of the underlying assets, and upon adding liquidity.</p>
  <p>You will get back the <a href="https://polygonscan.com/token/${tokenAddress}" target="_blank" style="color: #BCAC83;"> Balancer ${poolName} LP tokens</a>.</p><br />
  <p> 3. Come back back here and hit "MAX" to deposit them all in this pool.</p>
  `;
};

export const curveFinanceArbitrumDocs = (poolName: string, tokenAddress: string) => {
  return `
  <p><b>How to acquire this token</b><p/><br />
  <p> 1. Head over to the <a href="https://arbitrum.curve.fi/${poolName}/deposit" target="_blank" style="color: #BCAC83;"> Curve ${poolName} Pool</a>.</p><br />
  <p> 2. You can then supply any of the underlying assets, and upon adding liquidity.</p>
  <p>You will get back the <a href="https://arbiscan.io/token/${tokenAddress}" target="_blank" style="color: #BCAC83;"> Curve ${poolName} LP tokens</a>.</p><br />
  <p> 3. Come back back here and hit "MAX" to deposit them all in this pool.</p>
  `;
};

export const saddleFinanceDocs = (poolName: string, tokenAddress: string) => {
  return `
  <p><b>How to acquire this token</b><p/><br />
  <p> 1. Head over to the <a href="https://saddle.exchange/#/pools/${poolName}/deposit" target="_blank" style="color: #BCAC83;"> Saddle ${poolName} Pool</a>.</p><br />
  <p> 2. You can then supply any of the underlying assets, and upon adding liquidity.</p>
  <p>You will get back the <a href="https://arbiscan.io/token/${tokenAddress}" target="_blank" style="color: #BCAC83;"> Saddle ${poolName} LP tokens</a>.</p><br />
  <p> 3. Come back back here and hit "MAX" to deposit them all in this pool.</p>
  `;
};

export const jarvisDocs = (v: string) => {
  return `
  <p><b>How to acquire this token</b><p/><br />
  <p>You can acquire this asset on the <a href="https://${v}-app.jarvis.exchange/" target="_blank" style="color: #BCAC83;">Jarvis Network</a> website.</p>`;
};

export const tangibleDocsUsdr = (action: string) => {
  return `
  <p><b>How to acquire this token</b><p/><br />
  <p>You can acquire this asset on the <a href="https://www.tangible.store/realusd?action=${action}" target="_blank" style="color: #BCAC83;">Tangible</a> website.</p>`;
};

export const oneInchDocs = (url: `https://${string}`) => `
<p><b>How to acquire this token</b><p/><br />
<p>You can acquire this asset for example via the <a href="${url}" target="_blank" style="color: #BCAC83;">1inch decentralized exchange</a>.</p>
`;

export const arrakisDocs = (networkName: string, chainId: number, vaultAddress: string) => {
  return `
  <p><b>How to acquire this Arrakis Vault token</b><p/><br /><p> 1. Make sure you are connected to ${networkName} Network on your browser wallet.</p><br />
  <p> 2. Head to the <a href="https://beta.arrakis.finance/vaults/${chainId}/${vaultAddress}/add" target="_blank" style="color: #BCAC83;">Arrakis Finance Vault</a> and deposit the desired amount of token pairs.</p>
  <p><b>NOTE:</b> You might have to convert between tokens and/or have to approve Arrakis to spend them. </p><br />
  <p> 3. Click on "Deposit".</p>
  <p>This will credit your wallet with the Arrakis Vault Tokens.</p><br />
  <p> 4. Come back back here and hit "MAX" to deposit them all in this pool.</p>
  `;
};

export const wombatDocs = (pool: string, tokenName: string) => {
  return `
  <p><b>How to acquire this token</b></p><br />
  <p>You can acquire this asset on the <a href="https://app.wombat.exchange/pool?pool=${pool}&token=${tokenName}&action=DEPOSIT"> Wombat Exchange </a> website</p>`;
};

export const thenaDocs = (poolAddress: string) => {
  return `
  <p><b>How to acquire this token</b><p/><br /><p> 1. Make sure you are connected to BNB Network on your browser wallet.</p><br />
  <p> 2. Head to the <a href="https://thena.fi/liquidity/manage/${poolAddress.toLowerCase()}" target="_blank" style="color: #BCAC83;"> Thena.fi Exchange </a> and deposit the desired amount of token pairs.</p>
  <p><b>NOTE:</b> You might have to convert between tokens and/or have to approve Thena to spend them. </p><br />
  <p> 3. Click on "Add Liquidty".</p>
  <p>This will credit your wallet with the Thena LP Tokens.</p><br />
  <p> 4. Come back back here and hit "MAX" to deposit them all in this pool.</p><br />
  <p> <b>NOTE</b>: do not stake the LPs on Thena, Midas will do that for you! </p>
  `;
};

export const pearlDocs = (poolAddress: string) => {
  return `
  <p><b>How to acquire this token</b><p/><br /><p> 1. Make sure you are connected to Polygon Network on your browser wallet.</p><br />
  <p> 2. Head to the <a href="https://www.pearl.exchange/liquidity/manage/${poolAddress.toLowerCase()}" target="_blank" style="color: #BCAC83;"> Pearl Exchange </a> and deposit the desired amount of token pairs.</p>
  <p><b>NOTE:</b> You might have to convert between tokens and/or have to approve Thena to spend them. </p><br />
  <p> 3. Click on "Add Liquidty".</p>
  <p>This will credit your wallet with the Pearl LP Tokens.</p><br />
  <p> 4. Come back back here and hit "MAX" to deposit them all in this pool.</p><br />
  <p> <b>NOTE</b>: do not stake the LPs on Peal, Midas will do that for you! </p>
  `;
};

type ThenaStrategy = "GAMMA_NARROW" | "GAMMA_STABLE" | "GAMMA_WIDE";

export const thenaDocsV2 = (token0: string, token1: string, poolAddress: string, strategy: ThenaStrategy) => {
  return `
  <p><b>How to acquire this token</b><p/><br /><p> 1. Make sure you are connected to BNB Network on your browser wallet.</p><br />
  <p> 2. Head to the <a href="https://thena.fi/liquidity/fusion?currency0=${token0}&currency1=${token1}&strategy=${strategy}" target="_blank" style="color: #BCAC83;"> Thena.fi Exchange </a> and deposit the desired amount of token pairs.</p>
  <p><b>NOTE:</b> You might have to convert between tokens and/or have to approve Thena to spend them. </p><br />
  <p> 3. Click on "Add Liquidty".</p>
  <p>This will credit your wallet with the Thena LP Tokens (${poolAddress}).</p><br />
  <p> 4. Come back back here and hit "MAX" to deposit them all in this pool.</p><br />
  <p> <b>NOTE</b>: <p> - Do not stake the LPs on Thena, Midas will do that for you! </p>  <p> - Make sure to use "AUTOMATIC" range for stable LPs </p> </p>
  `;
};

export const lidoFinanceDocs = (chainName: string, baseToken: string, returnToken: string) => {
  return `
  <p><b>How to acquire this token</b><p/><br />
  <p>You can get <code>${returnToken}</code> by staking your <code>${baseToken}</code> on <a href="https://${chainName}.lido.fi/" target="_blank" style="color: #BCAC83; cursor="pointer">Lido on ${
    chainName.charAt(0).toUpperCase() + chainName.slice(1)
  }</a></p>`;
};

export const sommFinanceMainnetDocs = (strategyName: string, returnToken: string, supplyTokens: string[]) => {
  return `
  <p><b>How to acquire this token</b><p/><br />
  <p>You can get <code>${returnToken}</code> by supplying any of your on the <code>${supplyTokens.join(
    ", "
  )}</code> on <a href="https://app.sommelier.finance/strategies/${strategyName}" target="_blank" style="color: #BCAC83; cursor="pointer">Sommelier strategy</a></p>`;
};

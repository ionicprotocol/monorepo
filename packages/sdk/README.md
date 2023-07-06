# `@ionicprotocol/sdk`

## Installation

`npm install @ionicprotocol/sdk`

```typescript
import { MidasSdk } from "@ionicprotocol/sdk";
import { ethers } from "ethers";

const chainId = 56;
const provider = new ethers.providers.JsonRpcProvider("PROVIDER_URL");

const sdk = new Fuse(provider, chainId);

const poolOne = await sdk.fetchFusePoolData("1");

const assetZero = poolOne.assets[0];

const borrowAPRAssetZero = sdk.ratePerBlockToAPY(
  assetZero.borrowRatePerBlock,
  20
);
const supplyAPYAssetZero = sdk.ratePerBlockToAPY(
  assetZero.supplyRatePerBlock,
  20
);
```

## Functions

### fetchFusePoolData

`fetchFusePoolData(poolId: string, signer?: string): Promise<FusePoolData>`

Fetch data about an individual pool on midas capital based on the pool id. The pool id can be extracted from the pool url `https://app.midascapital.xyz/56/pool/POOL_ID`

### ratePerBlockToAPY

`ratePerBlockToAPY(ratePerBlock: BigNumber, blocksPerMin: number): number`

Return the APY for a given current per-block borrow/supply interest rate. This rate can be included in the

`FusePoolData['assets'][0].borrowRatePerBlock`
and

`FusePoolData['assets'][0].supplyRatePerBlock`
correspondingly. (i.e. blocksPerMin for BSC: `20`)

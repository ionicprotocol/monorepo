[![Netlify Status](https://api.netlify.com/api/v1/badges/4e389938-790e-4adb-bfc9-0e3d47dafd64/deploy-status)](https://app.netlify.com/sites/midas-capital-dapp/deploys)

# monorepo

## Installation

### Clone

Make sure you clone submodules together.

`git clone --recurse-submodules`

If you already pulled using just `git clone`, you can use below command to update submodules.

`git submodule update --init --recursive`

### Dependencies

- Node [`16.x`](https://nodejs.org/en/download/)
- Yarn (preinstalled with Node 16)
- [Foundry](https://book.getfoundry.sh/getting-started/installation.html)

From fresh clone:

- `yarn`
- `yarn workspace @midas-capital/sdk forge install`
- `yarn workspace @midas-capital/sdk build`

## Tips

Run _everything_ from the top level.

Ask for **.env** file from the team and add it under packages/sdk

If you want to add packages to modules, you can do so like:

- `yarn workspace @midas-capital/sdk add ethers`

To run `forge` commands inside the `sdk` package, run:

- `yarn workspace @midas-capital/sdk forge install <SOME_DEP>`
- `yarn workspace @midas-capital/sdk forge build`
- etc

## Adding a Package

- Copy source into `packages/my-new-package`.
- Add reference to root `tsconfig.json`:

```json
{
  ...
  "references": [
    ...
    {
      "path": "./packages/my-new-package"
    }
  ]
}
```

- Add workspace-level dependencies to `package.json` inside the package:

```json
{
  ...
  "dependencies": {
    ...
    "@midas-capital/some-other-package": "workspace:*"
  }
}
- `yarn` from top-level to update dependencies/symlinks.
```


## Working with Forks

Forking requires access to a archive RPC node. For BSC we had a great experience using an RPC Node from NodeReals MegaNode service - https://nodereal.io/meganode .

For forking Polygon we haven't found a free service to use an archive node yet.

You general purpose forking you have to set `FORK_RPC_URL` and `FORK_CHAIN_ID` in your `packages/sdk/.env` file.

And than start a forked local node by running.

```
> yarn dev:node:fork
```

In order to start multiple forks at once we streamlined the process a bit. In your executing shell make sure to set `BSC_RPC_URL` and or `POLYGON_RPC_URL`.


```
> yarn dev:node:bsc
// Will start a CHAIN_ID=56 fork using $BSC_RPC_URL at https://localhost:8545
```

```
> yarn dev:node:polygon
// Will start a CHAIN_ID=137 fork using $POLYGON_RPC_URL at https://localhost:8546
```

The idea is to increase the port number with each fork we want to support.

```
8545: BSC
8546: Polygon
8547: Moonbeam?
```

For convenience we have a Hardhat task to make some token swaps to on the forked node for you.

```
> yarn workspace @midas-capital/sdk hardhat fork:fund-accounts --network fork
// Works with https://localhost:8545

> yarn workspace @midas-capital/sdk hardhat fork:fund-accounts --network localbsc
// Works with https://localhost:8545

> yarn workspace @midas-capital/sdk hardhat fork:fund-accounts --network localpolygon
// Works with https://localhost:8546
```

## Running UI Tests

We are using [ChainSafe/dappeteer](https://github.com/ChainSafe/dappeteer) to test our UI with Metamask. The test are expecting to work on a fork of BSC mainnet for now.

Follow this step to run the UI test locally

1) Start local forked BSC node
```
> yarn dev:node:fork
```

2) Start local UI dev server
```
> yarn dev:ui
```

3) Fund test accounts
```
> yarn workspace @midas-capital/sdk hardhat fork:fund-accounts --network fork
```

4) Run dAppateer
```
> yarn test:ui
```
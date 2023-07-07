# Fuse by Ionic Protocol: Liquidator Bot

This repository contains the TypeScript source code for the Fuse Liquidator Bot.

## How it works

When running a Fuse pool, you need a bot to liquidate unhealthy loans. Fortunately, [Fuse's Safe Liquidator contract](https://github.com/ionicprotocol/contracts/blob/development/contracts/FuseSafeLiquidator.sol) allows liquidators to safely liquidate loans on any Fuse Pool by confirming on-chain that the liquidator will not lose money on each liquidation, so you will likely have external liquidators working for you. However, you may want to spin up a liquidator bot for profit or to improve the efficency of your own pool(s). Note that liquidations require ETH for gas, but you can set a minimum profit amount for your liquidations.

## Build

From the top level:

```
>>> yarn
>>> yarn workspace @ionicprotocol/liquidator build
```

Or with docker:

```
docker build -t liquidator -f docker/liquidator/Dockerfile
```

## Run

Export the relevant environment variables:

```
export ETHEREUM_ADMIN_ACCOUNT="0x321..."
export ETHEREUM_ADMIN_PRIVATE_KEY="0x123..."
export WEB3_HTTP_PROVIDER_URL="https://bsc-mainnet.gateway.pokt.network/v1/lb/xxxxxxxxxx"
export TARGET_CHAIN_ID=56
```

And run outside docker:

```
>>> node build/index.js
```

Or with docker:

```
>>> docker run -it -e ETHEREUM_ADMIN_ACCOUNT=$ETHEREUM_ADMIN_ACCOUNT \
                   -e ETHEREUM_ADMIN_PRIVATE_KEY=$ETHEREUM_ADMIN_PRIVATE_KEY \
                   -e WEB3_HTTP_PROVIDER_URL=$WEB3_HTTP_PROVIDER_URL \
                   -e TARGET_CHAIN_ID=56 liquidator
```

## Deploy

Automated via Terraform -- see `./monorepo/ops/` directory

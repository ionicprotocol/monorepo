[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

# Fuse by Midas Capital: Uniswap TWAP Bot

This repository contains the TypeScript source code for the Fuse Uniswap Twap Bot.

## How it works

This bot updates on-chain price data for Fuse pools via [TWAPs of Uniswap V2 (and SushiSwap) pairs](https://uniswap.org/docs/v2/core-concepts/oracles/)
based in ETH. If you are using prices for which others are not reliably posting TWAPs, you will need to run a bot and a
redundancy bot; if others are reliably posting TWAPs, simply run your own redundancy bot for additional security. Note
that the more often you update the oracle and the more assets you do so for, the ETH you will spend on gas fees.
However, also note that infrequent updates to an asset's price could leave room for attackers to profit via arbitrage
at the expense of your users.

## Build

From the top level:

```
>>> yarn
>>> yarn workspace @midas-capital/fuse-twap-bot build
```

Or with docker:

```
docker build -t oracle-monitor -f docker/twap/Dockerfile
```

## Run

Export the relevant environmnet variables:

```
export ETHEREUM_ADMIN_ACCOUNT="0x321..."
export ETHEREUM_ADMIN_PRIVATE_KEY="0x123..."
export WEB3_HTTP_PROVIDER_URL="https://bsc-mainnet.gateway.pokt.network/v1/lb/xxxxxxxxxx"
export CHECK_PRICE_INTERVAL="300"
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
                   -e CHECK_PRICE_INTERVAL=$CHECK_PRICE_INTERVAL \
                   -e TARGET_CHAIN_ID=56 oracle-monitor
```

## Deploy

Automated via Terraform -- see `./monorepo/ops/` directory
